import { Flame, Calendar } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';

// Mock data — will be replaced by StreakDAO
const MOCK = {
  currentStreak: 14,
  longestStreak: 30,
  lastActive: 'Today',
  streakAlive: true,
};

export function StreakCard() {
  const { currentStreak, longestStreak, streakAlive } = MOCK;

  return (
    <Card>
      <CardHeader
        title="Streak"
        icon={Flame}
        action={
          <Badge color={streakAlive ? 'success' : 'danger'}>
            {streakAlive ? 'Active' : 'At Risk'}
          </Badge>
        }
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Flame
            className={`h-8 w-8 ${streakAlive ? 'text-orange-400 animate-streak-fire' : 'text-slate-600'}`}
          />
          <div>
            <span className="text-3xl font-extrabold tabular-nums text-slate-50">
              {currentStreak}
            </span>
            <span className="ml-1 text-sm text-slate-400">days</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <Calendar className="h-3 w-3" />
        <span>Best: {longestStreak} days</span>
      </div>

      {/* Mini streak calendar — last 14 days */}
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 14 }, (_, i) => {
          const active = i < currentStreak;
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                active ? 'bg-orange-400' : 'bg-slate-700'
              }`}
            />
          );
        })}
      </div>
    </Card>
  );
}
