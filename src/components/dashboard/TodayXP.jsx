import { Zap, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

// Mock data — will be replaced by ActivityDAO
const MOCK = {
  todayXP: 42,
  dailyTarget: 80,
  breakdown: {
    body: 12,
    mind: 15,
    learning: 8,
    communication: 4,
    technical: 3,
    social: 0,
    discipline: 0,
  },
};

const CATEGORY_COLORS = {
  body: 'bg-red-500',
  mind: 'bg-violet-500',
  learning: 'bg-blue-500',
  communication: 'bg-amber-500',
  technical: 'bg-emerald-500',
  social: 'bg-pink-500',
  discipline: 'bg-indigo-500',
};

const CATEGORY_LABELS = {
  body: 'Body',
  mind: 'Mind',
  learning: 'Learn',
  communication: 'Comm',
  technical: 'Tech',
  social: 'Social',
  discipline: 'Focus',
};

export function TodayXP() {
  const { todayXP, dailyTarget, breakdown } = MOCK;

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader title="Today's XP" icon={Zap} subtitle="Keep pushing" />

      <div className="flex items-end gap-3">
        <span className="text-4xl font-extrabold tabular-nums text-slate-50">{todayXP}</span>
        <span className="mb-1 text-sm text-slate-500">/ {dailyTarget} XP</span>
      </div>

      <ProgressBar
        value={todayXP}
        max={dailyTarget}
        color="bg-gradient-to-r from-violet-500 to-indigo-500"
        size="md"
        className="mt-3"
      />

      {/* Mini category bars */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {Object.entries(breakdown).map(([cat, xp]) => (
          <div key={cat} className="flex flex-col items-center gap-1">
            <div className="h-12 w-full rounded-md bg-slate-700/50 relative overflow-hidden">
              <div
                className={`absolute bottom-0 w-full rounded-md ${CATEGORY_COLORS[cat]} transition-all duration-500`}
                style={{ height: `${Math.min(100, (xp / 20) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500">{CATEGORY_LABELS[cat]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
