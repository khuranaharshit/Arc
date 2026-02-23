import { TrendingUp, Star } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';

const MOCK = {
  currentLevel: 2, levelName: 'Building', weeklyXP: 92,
  weeklyTarget: 120, consecutiveWeeks: 2, requiredWeeks: 3,
};

export function LevelCard() {
  const { currentLevel, levelName, weeklyXP, weeklyTarget, consecutiveWeeks, requiredWeeks } = MOCK;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-500/10 blur-2xl" />
      <CardHeader
        title="Level"
        icon={TrendingUp}
        action={<Badge color="primary">Lv.{currentLevel}</Badge>}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Star className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white">{levelName}</h4>
          <p className="text-xs text-white/30">
            {weeklyXP} / {weeklyTarget} XP this week
          </p>
        </div>
      </div>

      <ProgressBar
        value={weeklyXP}
        max={weeklyTarget}
        gradient="from-indigo-500 via-purple-500 to-pink-500"
        size="md"
        showLabel
        label="Weekly XP"
        className="mt-3"
      />

      <div className="mt-2 text-xs text-white/25">
        {consecutiveWeeks}/{requiredWeeks} weeks at target for next level
      </div>
    </Card>
  );
}
