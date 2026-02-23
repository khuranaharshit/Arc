import { Zap } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

const MOCK = {
  todayXP: 42, dailyTarget: 80,
  breakdown: { body: 12, mind: 15, learning: 8, communication: 4, technical: 3, social: 0, discipline: 0 },
};

const CATEGORY_COLORS = {
  body: '#f43f5e', mind: '#a855f7', learning: '#3b82f6',
  communication: '#f59e0b', technical: '#10b981', social: '#ec4899', discipline: '#6366f1',
};
const CATEGORY_LABELS = {
  body: 'Body', mind: 'Mind', learning: 'Learn',
  communication: 'Comm', technical: 'Tech', social: 'Social', discipline: 'Focus',
};

export function TodayXP() {
  const { todayXP, dailyTarget, breakdown } = MOCK;
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />
      <CardHeader title="Today's XP" icon={Zap} subtitle="Keep pushing" />
      <div className="flex items-end gap-3">
        <span className="text-4xl font-extrabold tabular-nums t-primary">{todayXP}</span>
        <span className="mb-1 text-sm t-muted">/ {dailyTarget} XP</span>
      </div>
      <ProgressBar value={todayXP} max={dailyTarget} gradient="from-purple-500 via-pink-500 to-orange-500" size="md" className="mt-3" />
      <div className="mt-4 grid grid-cols-7 gap-1">
        {Object.entries(breakdown).map(([cat, xp]) => (
          <div key={cat} className="flex flex-col items-center gap-1">
            <div className="h-12 w-full rounded-lg relative overflow-hidden" style={{ background: 'var(--color-surface-row)' }}>
              <div className="absolute bottom-0 w-full rounded-lg transition-all duration-700"
                style={{ height: `${Math.min(100, (xp / 20) * 100)}%`, background: CATEGORY_COLORS[cat], opacity: 0.8 }} />
            </div>
            <span className="text-[9px] t-muted">{CATEGORY_LABELS[cat]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
