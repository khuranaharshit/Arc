import { useState, useEffect } from 'react';
import { Swords, CheckCircle, Circle, Zap, Gift } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const CATEGORY_COLORS = {
  body: '#f43f5e', mind: '#a855f7', learning: '#3b82f6',
  communication: '#f59e0b', technical: '#10b981', social: '#ec4899', discipline: '#6366f1',
};

export function QuestCard() {
  const { questDAO, activityDAO, streakDAO, config } = useData();
  const { addToast } = useToast();
  const [quests, setQuests] = useState(null);

  useEffect(() => {
    questDAO.getTodayQuests(config.xpMenu).then(setQuests);
  }, [questDAO, config.xpMenu]);

  // Poll for quest completion (activities logged elsewhere)
  useEffect(() => {
    const check = async () => {
      const todayActs = await activityDAO.getTodayActivities();
      const loggedKeys = new Set(todayActs.map((a) => a.activity_key));
      const questData = await questDAO.getTodayQuests(config.xpMenu);

      let changed = false;
      for (const q of questData.quests) {
        if (!q.completed && loggedKeys.has(q.activity_key)) {
          const result = await questDAO.completeQuest(q.activity_key);
          changed = true;
          if (result.all_done && result.bonus_xp > 0) {
            addToast(`ALL QUESTS DONE! +${result.bonus_xp} XP bonus!`, 'xp');
          }
        }
      }
      if (changed) setQuests(await questDAO.getTodayQuests(config.xpMenu));
    };
    const iv = setInterval(check, 2000);
    return () => clearInterval(iv);
  }, [questDAO, activityDAO, config.xpMenu, addToast]);

  if (!quests) return null;

  const doneCount = quests.quests.filter((q) => q.completed).length;
  const allDone = doneCount === quests.quests.length;
  const totalXP = quests.quests.reduce((s, q) => s + q.xp, 0);
  const bonusXP = Math.round(totalXP * 0.5);

  return (
    <Card className={`relative overflow-hidden ${allDone ? 'border-emerald-500/20' : ''}`}>
      {allDone && <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-500/10 blur-2xl" />}
      <CardHeader title="Daily Quests" icon={Swords}
        subtitle={`${doneCount}/${quests.quests.length} completed`}
        action={allDone ? <Badge color="success" icon={Gift}>Bonus claimed!</Badge> : null}
      />

      <div className="space-y-2">
        {quests.quests.map((q) => (
          <div key={q.activity_key}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${q.completed ? 'opacity-60' : ''}`}
            style={{ background: 'var(--color-surface-row)' }}>
            {q.completed
              ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              : <Circle className="h-4 w-4 t-faint shrink-0" />
            }
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[q.category] }} />
            <span className={`flex-1 text-sm ${q.completed ? 't-muted line-through' : 't-secondary'}`}>
              {q.label}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-purple-400">
              <Zap className="h-3 w-3" />{q.xp}
            </span>
          </div>
        ))}
      </div>

      {!allDone && (
        <div className="mt-3 rounded-xl px-3 py-2 text-center text-xs t-muted" style={{ background: 'var(--color-surface-row)' }}>
          Complete all 3 for <span className="font-bold text-purple-400">+{bonusXP} XP</span> bonus (1.5x)
        </div>
      )}
    </Card>
  );
}
