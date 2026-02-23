import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const CATEGORY_COLORS = {
  body: '#f43f5e', mind: '#a855f7', learning: '#3b82f6',
  communication: '#f59e0b', technical: '#10b981', social: '#ec4899', discipline: '#6366f1',
};

export function ActivityMenu() {
  const { activityDAO, streakDAO, achievementDAO, config } = useData();
  const { addToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('all');
  const [confirmActivity, setConfirmActivity] = useState(null);
  const [loggedToday, setLoggedToday] = useState(new Set());

  const xpMenu = config.xpMenu;
  const activities = xpMenu.activities;
  const categories = xpMenu.categories;

  // Load today's already-logged activities
  useEffect(() => {
    activityDAO.getTodayActivities().then((acts) => {
      setLoggedToday(new Set(acts.map((a) => a.activity_key)));
    });
  }, [activityDAO]);

  const filtered = activeCategory === 'all'
    ? activities
    : activities.filter((a) => a.category === activeCategory);

  const handleLog = async () => {
    if (!confirmActivity) return;
    try {
      const result = await activityDAO.logActivity(confirmActivity.key, xpMenu);
      const parts = [];
      if (result.critical_hit) parts.push('CRITICAL HIT!');
      parts.push(`+${result.xp_earned} XP — ${confirmActivity.label}`);
      addToast(parts.join(' '), 'xp');

      if (result.combo_triggered) {
        addToast(`COMBO BONUS! +${xpMenu.combo_bonus_xp} XP for ${xpMenu.combo_threshold_categories}+ categories`, 'xp');
      }

      // Update streak
      const todayXP = await activityDAO.getTodayXP();
      const streakResult = await streakDAO.updateStreak(todayXP, config.streaks);
      if (streakResult.bonus_earned) {
        addToast(`Streak bonus! ${streakResult.bonus_earned.days}-day streak: +${streakResult.bonus_earned.xp} XP`, 'xp');
      }

      // Check achievements
      const newAch = await achievementDAO.checkAll(config.achievements, { activityDAO, streakDAO, levelDAO: null, reviewDAO: null });
      newAch.forEach((ach) => addToast(`Achievement unlocked: ${ach.name}!`, 'success'));

      setLoggedToday((prev) => new Set([...prev, confirmActivity.key]));
    } catch (err) {
      addToast(err.message, 'error');
    }
    setConfirmActivity(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Log XP</h1>
        <p className="text-sm t-muted">Tap an activity to log it.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button onClick={() => setActiveCategory('all')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            activeCategory === 'all' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 't-tertiary'
          }`}
          style={activeCategory !== 'all' ? { background: 'var(--color-surface-row)' } : {}}>All</button>
        {categories.map((cat) => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat.key ? 'text-white shadow-lg' : 't-tertiary'
            }`}
            style={activeCategory === cat.key ? { background: cat.color } : { background: 'var(--color-surface-row)' }}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((act) => {
          const done = loggedToday.has(act.key);
          return (
            <button key={act.key} disabled={done && act.once_per_day}
              className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all active:scale-[0.98] ${
                done ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60' : ''
              }`}
              style={!done ? { borderColor: 'var(--color-border)', background: 'var(--color-surface-row)' } : {}}
              onClick={() => !done && setConfirmActivity(act)}>
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[act.category] }} />
                <div>
                  <p className={`text-sm font-medium ${done ? 'text-emerald-400/80 line-through' : 't-secondary'}`}>{act.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {act.once_per_day && <span className="text-[10px] t-faint">1x/day</span>}
                    {done && <span className="text-[10px] text-emerald-400/60">Logged</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-purple-400">
                <Zap className="h-3.5 w-3.5" />{act.xp}
              </div>
            </button>
          );
        })}
      </div>

      <Modal isOpen={!!confirmActivity} onClose={() => setConfirmActivity(null)} title="Log Activity">
        {confirmActivity && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: 'var(--color-surface-row)' }}>
              <div className="h-3 w-3 rounded-full" style={{ background: CATEGORY_COLORS[confirmActivity.category] }} />
              <div>
                <p className="text-sm font-semibold t-primary">{confirmActivity.label}</p>
                <p className="text-xs t-muted">{categories.find(c => c.key === confirmActivity.category)?.label}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-purple-400">
              <Zap className="h-6 w-6" />+{confirmActivity.xp} XP
            </div>
            <p className="text-center text-xs t-muted">{Math.round(xpMenu.critical_hit_chance * 100)}% chance of critical hit ({xpMenu.critical_hit_multiplier}x XP)</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmActivity(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleLog} className="btn-primary flex-1">Log it!</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
