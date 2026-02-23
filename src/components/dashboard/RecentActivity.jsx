import { Clock, Zap, Sparkles } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';

// Mock data — will be replaced by ActivityDAO
const MOCK_ACTIVITIES = [
  {
    id: '1',
    label: 'Exercise (30+ min)',
    category: 'body',
    xp: 9.6,
    criticalHit: false,
    time: '6:30 AM',
  },
  {
    id: '2',
    label: 'Brilliant.org lesson',
    category: 'mind',
    xp: 6,
    criticalHit: false,
    time: '7:15 AM',
  },
  {
    id: '3',
    label: '1 LeetCode problem',
    category: 'mind',
    xp: 16,
    criticalHit: true,
    time: '8:00 AM',
  },
  {
    id: '4',
    label: 'Read physical book (20+ min)',
    category: 'learning',
    xp: 6,
    criticalHit: false,
    time: '9:30 AM',
  },
  {
    id: '5',
    label: 'No phone first 30 min',
    category: 'body',
    xp: 3,
    criticalHit: false,
    time: '6:00 AM',
  },
];

const CATEGORY_DOT_COLORS = {
  body: 'bg-red-400',
  mind: 'bg-violet-400',
  learning: 'bg-blue-400',
  communication: 'bg-amber-400',
  technical: 'bg-emerald-400',
  social: 'bg-pink-400',
  discipline: 'bg-indigo-400',
};

export function RecentActivity() {
  return (
    <Card className="col-span-full">
      <CardHeader title="Recent Activity" icon={Clock} subtitle="Today" />

      <div className="space-y-2">
        {MOCK_ACTIVITIES.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${CATEGORY_DOT_COLORS[act.category]}`} />
              <span className="text-sm text-slate-200">{act.label}</span>
              {act.criticalHit && (
                <Badge color="warning" icon={Sparkles}>
                  Crit!
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{act.time}</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-violet-400">
                <Zap className="h-3 w-3" />+{act.xp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
