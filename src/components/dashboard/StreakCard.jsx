import { Flame, Calendar } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';

const MOCK = { currentStreak: 14, longestStreak: 30, streakAlive: true };

export function StreakCard() {
  const { currentStreak, longestStreak, streakAlive } = MOCK;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl" />
      <CardHeader
        title="Streak"
        icon={Flame}
        action={
          <Badge color={streakAlive ? 'success' : 'danger'}>
            {streakAlive ? 'Active' : 'At Risk'}
          </Badge>
        }
      />

      <div className="flex items-center gap-3">
        <Flame
          className={`h-9 w-9 ${streakAlive ? 'text-orange-400 animate-streak-fire' : 'text-white/20'}`}
        />
        <div>
          <span className="text-3xl font-extrabold tabular-nums text-white">
            {currentStreak}
          </span>
          <span className="ml-1 text-sm text-white/30">days</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-white/30">
        <Calendar className="h-3 w-3" />
        <span>Best: {longestStreak} days</span>
      </div>

      <div className="mt-3 flex gap-1">
        {Array.from({ length: 14 }, (_, i) => {
          const active = i < currentStreak;
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                active
                  ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                  : 'bg-white/5'
              }`}
              style={active ? { opacity: 0.5 + (i / 14) * 0.5 } : {}}
            />
          );
        })}
      </div>
    </Card>
  );
}
