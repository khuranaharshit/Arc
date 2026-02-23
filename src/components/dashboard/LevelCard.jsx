import { useState, useEffect } from 'react';
import { TrendingUp, Star } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { useData } from '../../context/DataContext';

export function LevelCard() {
  const { levelDAO, activityDAO, config } = useData();
  const [levelData, setLevelData] = useState(null);
  const [weekXP, setWeekXP] = useState(0);

  useEffect(() => {
    const load = async () => {
      const ld = await levelDAO.getLevelData();
      setLevelData(ld);

      // Calculate this week's XP from activity history (last 7 days)
      const hist = await activityDAO.getXPHistory(7);
      const total = hist.reduce((s, d) => s + d.xp, 0);
      setWeekXP(Math.round(total));

      // Update level DAO with current week's XP
      await levelDAO.updateWeeklyXP(total, config.levels);
      const updated = await levelDAO.getLevelData();
      setLevelData(updated);
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [levelDAO, activityDAO, config.levels]);

  if (!levelData) return null;

  const levels = config.levels.levels;
  const currentLevelCfg = levels.find((l) => l.level === levelData.current_level) || levels[0];
  const nextLevel = levels.find((l) => l.level === levelData.current_level + 1);
  const target = nextLevel ? nextLevel.weekly_xp : currentLevelCfg.weekly_xp;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-500/10 blur-2xl" />
      <CardHeader title="Level" icon={TrendingUp} action={<Badge color="primary">Lv.{levelData.current_level}</Badge>} />
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Star className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h4 className="text-lg font-bold t-primary">{levelData.current_level_name}</h4>
          <p className="text-xs t-muted">{weekXP} / {target} XP this week</p>
        </div>
      </div>
      <ProgressBar value={weekXP} max={target} gradient="from-indigo-500 via-purple-500 to-pink-500" size="md" showLabel label="Weekly XP" className="mt-3" />
      {nextLevel && (
        <div className="mt-2 text-xs t-muted">
          {levelData.consecutive_weeks_at_target}/{nextLevel.consecutive_weeks} weeks at {nextLevel.weekly_xp}+ XP for <strong className="t-secondary">{nextLevel.name}</strong>
        </div>
      )}
      {!nextLevel && (
        <div className="mt-2 text-xs text-purple-400 font-medium">Max level reached!</div>
      )}
    </Card>
  );
}
