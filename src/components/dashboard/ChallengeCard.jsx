import { useState, useEffect } from 'react';
import { Swords, Shield, CheckCircle, Circle, Trophy } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { useData } from '../../context/DataContext';

export function ChallengeCard() {
  const { challengeDAO, config } = useData();
  const [weekly, setWeekly] = useState(null);
  const [boss, setBoss] = useState(null);
  const [tab, setTab] = useState('weekly');

  useEffect(() => {
    challengeDAO.getWeeklyChallenge(config.xpMenu).then(setWeekly);
    challengeDAO.getBossBattle().then(setBoss);
  }, [challengeDAO, config.xpMenu]);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-rose-500/8 blur-2xl" />

      {/* Tab toggle */}
      <div className="flex gap-1 rounded-xl p-0.5 mb-3" style={{ background: 'var(--color-surface-row)' }}>
        <button onClick={() => setTab('weekly')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
            tab === 'weekly' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow' : 't-muted'
          }`}>
          <Swords className="h-3 w-3" /> Weekly
        </button>
        <button onClick={() => setTab('boss')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
            tab === 'boss' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow' : 't-muted'
          }`}>
          <Shield className="h-3 w-3" /> Boss
        </button>
      </div>

      {tab === 'weekly' && weekly && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold t-primary">{weekly.name}</h3>
            {weekly.completed
              ? <Badge color="success">+{weekly.bonus_xp} XP</Badge>
              : <Badge color="primary">{weekly.tasks.filter((t) => t.done).length}/{weekly.tasks.length}</Badge>
            }
          </div>
          <p className="text-xs t-muted mb-3">{weekly.description}</p>
          <div className="space-y-1">
            {weekly.tasks.map((task) => (
              <div key={task.activity_key} className="flex items-center gap-2 text-xs">
                {task.done
                  ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  : <Circle className="h-3.5 w-3.5 t-faint shrink-0" />
                }
                <span className={task.done ? 't-muted line-through' : 't-secondary'}>{task.label}</span>
              </div>
            ))}
          </div>
          {!weekly.completed && (
            <p className="mt-2 text-[10px] text-center t-faint">
              Complete all for <span className="font-bold text-purple-400">+{weekly.bonus_xp} XP</span>
            </p>
          )}
        </>
      )}

      {tab === 'boss' && boss && (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐉</span>
              <h3 className="text-sm font-bold t-primary">{boss.name}</h3>
            </div>
            {boss.defeated
              ? <Badge color="success" icon={Trophy}>Defeated!</Badge>
              : <Badge color="danger">{boss.month}</Badge>
            }
          </div>
          <p className="text-xs t-muted mb-3">{boss.description}</p>
          <ProgressBar value={boss.current || 0} max={boss.target}
            gradient={boss.defeated ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-orange-500'}
            size="lg" showLabel label={`${boss.current || 0} / ${boss.target}`} />
          {!boss.defeated && (
            <p className="mt-2 text-[10px] text-center t-faint">
              Defeat for <span className="font-bold text-orange-400">+{boss.xp_reward} XP</span>
            </p>
          )}
        </>
      )}
    </Card>
  );
}
