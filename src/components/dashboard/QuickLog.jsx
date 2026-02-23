import { Plus, HeartPulse, Brain, BookOpen, Code, Shield } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const QUICK_ACTIONS = [
  { key: 'exercise_30min', label: 'Exercise', icon: HeartPulse, gradient: 'from-rose-500 to-pink-600' },
  { key: 'brilliant_lesson', label: 'Brilliant', icon: Brain, gradient: 'from-purple-500 to-violet-600' },
  { key: 'read_book_20min', label: 'Read', icon: BookOpen, gradient: 'from-blue-500 to-indigo-600' },
  { key: 'leetcode_problem', label: 'LeetCode', icon: Code, gradient: 'from-emerald-500 to-teal-600' },
  { key: 'no_social_media', label: 'No Social', icon: Shield, gradient: 'from-indigo-500 to-purple-600' },
];

export function QuickLog() {
  const navigate = useNavigate();
  const { activityDAO, streakDAO, config } = useData();
  const { addToast } = useToast();

  const xpMenu = config.xpMenu;
  const activityMap = {};
  xpMenu.activities.forEach((a) => { activityMap[a.key] = a; });

  const handleLog = async (actionKey) => {
    try {
      const result = await activityDAO.logActivity(actionKey, xpMenu);
      const label = activityMap[actionKey]?.label || actionKey;
      const parts = [];
      if (result.critical_hit) parts.push('CRITICAL HIT!');
      parts.push(`+${result.xp_earned} XP — ${label}`);
      addToast(parts.join(' '), 'xp');

      const todayXP = await activityDAO.getTodayXP();
      await streakDAO.updateStreak(todayXP, config.streaks);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <Card>
      <CardHeader title="Quick Log" icon={Plus}
        action={<button onClick={() => navigate('/log')} className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">View all</button>} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const act = activityMap[action.key];
          return (
            <button key={action.key}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-row)' }}
              onClick={() => handleLog(action.key)}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium t-tertiary">{action.label}</span>
              <span className="text-[10px] t-faint">+{act?.xp || '?'} XP</span>
            </button>
          );
        })}
        <button onClick={() => navigate('/log')}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed p-3 t-faint transition-all hover:t-muted"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed" style={{ borderColor: 'var(--color-border)' }}>
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </Card>
  );
}
