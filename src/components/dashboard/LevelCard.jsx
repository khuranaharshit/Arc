import { TrendingUp, Star } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';

// Mock data — will be replaced by LevelDAO
const MOCK = {
  currentLevel: 2,
  levelName: 'Building',
  weeklyXP: 92,
  weeklyTarget: 120,
  consecutiveWeeks: 2,
  requiredWeeks: 3,
};

export function LevelCard() {
  const { currentLevel, levelName, weeklyXP, weeklyTarget, consecutiveWeeks, requiredWeeks } = MOCK;

  return (
    <Card>
      <CardHeader
        title="Level"
        icon={TrendingUp}
        action={<Badge color="primary">Lv.{currentLevel}</Badge>}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
          <Star className="h-6 w-6 text-primary-light" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-100">{levelName}</h4>
          <p className="text-xs text-slate-400">
            {weeklyXP} / {weeklyTarget} XP this week
          </p>
        </div>
      </div>

      <ProgressBar
        value={weeklyXP}
        max={weeklyTarget}
        color="bg-gradient-to-r from-violet-500 to-purple-500"
        size="md"
        showLabel
        label="Weekly XP"
        className="mt-3"
      />

      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
        <span>
          {consecutiveWeeks}/{requiredWeeks} weeks at target for next level
        </span>
      </div>
    </Card>
  );
}
