import { useState, useEffect } from 'react';
import { Trophy, Lock, Zap, Flame, Book, Code, PenTool, Shield, Crown, Calendar, Ghost, EyeOff, Hammer, ShieldAlert } from 'lucide-react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { useData } from '../../context/DataContext';

const ICON_MAP = {
  zap: Zap, book: Book, library: Book, flame: Flame, diamond: Trophy,
  cpu: Code, hammer: Hammer, 'shield-alert': ShieldAlert, 'pen-tool': PenTool,
  ghost: Ghost, 'eye-off': EyeOff, crown: Crown, calendar: Calendar,
};

export function AchievementList() {
  const { achievementDAO, config } = useData();
  const [achData, setAchData] = useState(null);

  useEffect(() => {
    achievementDAO.getAchievementData().then(setAchData);
  }, [achievementDAO]);

  const allAch = config.achievements.achievements;
  const unlocked = achData?.unlocked || [];
  const progress = achData?.progress || {};
  const unlockedKeys = new Set(unlocked.map((u) => u.key));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Achievements</h1>
        <p className="text-sm t-muted">{unlocked.length} / {allAch.length} unlocked</p>
      </div>

      {unlocked.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-emerald-400">Unlocked</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allAch.filter((a) => unlockedKeys.has(a.key)).map((ach) => {
              const Icon = ICON_MAP[ach.icon] || Trophy;
              const u = unlocked.find((x) => x.key === ach.key);
              return (
                <Card key={ach.key} glow className="border-emerald-500/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                      <Icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold t-primary">{ach.name}</h3>
                      <p className="text-xs t-muted">{ach.description}</p>
                      <p className="mt-1 text-[10px] text-emerald-400/50">{u?.unlocked_at?.split('T')[0]}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold t-tertiary">In Progress</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allAch.filter((a) => !unlockedKeys.has(a.key)).map((ach) => {
            const Icon = ICON_MAP[ach.icon] || Lock;
            const p = progress[ach.key] || { current: 0, target: ach.condition.value };
            const pct = p.target > 0 ? Math.round((p.current / p.target) * 100) : 0;
            return (
              <Card key={ach.key} className="opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-surface-row)' }}>
                    <Icon className="h-5 w-5 t-faint" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold t-tertiary">{ach.name}</h3>
                    <p className="text-xs t-muted">{ach.description}</p>
                    <ProgressBar value={p.current} max={p.target} size="sm" color="bg-purple-500/30" className="mt-2" />
                    <p className="mt-1 text-[10px] t-muted">{p.current}/{p.target} ({pct}%)</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
