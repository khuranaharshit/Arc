import { useState, useEffect } from 'react';
import { Clock, Zap, Sparkles } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { useData } from '../../context/DataContext';
import { formatTime } from '../../utils/dates';

const DOT = { body: '#f43f5e', mind: '#a855f7', learning: '#3b82f6', communication: '#f59e0b', technical: '#10b981', social: '#ec4899', discipline: '#6366f1' };

export function RecentActivity() {
  const { activityDAO, config } = useData();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const load = async () => {
      const acts = await activityDAO.getTodayActivities();
      setActivities(acts.slice(-5).reverse());
    };
    load();
    const iv = setInterval(load, 2000);
    return () => clearInterval(iv);
  }, [activityDAO]);

  // Resolve labels from config
  const activityMap = {};
  config.xpMenu.activities.forEach((a) => { activityMap[a.key] = a.label; });

  if (activities.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader title="Recent Activity" icon={Clock} subtitle="Today" />
        <p className="text-sm t-muted text-center py-6">No activities logged yet today. Start earning XP!</p>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader title="Recent Activity" icon={Clock} subtitle="Today" />
      <div className="space-y-1.5">
        {activities.map((act) => (
          <div key={act.id} className="surface-row">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full" style={{ background: DOT[act.category] }} />
              <span className="text-sm t-secondary">{activityMap[act.activity_key] || act.activity_key}</span>
              {act.critical_hit && <Badge color="warning" icon={Sparkles}>Crit!</Badge>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs t-faint">{formatTime(act.timestamp)}</span>
              <span className="flex items-center gap-1 text-sm font-bold text-purple-400">
                <Zap className="h-3 w-3" />+{act.xp_earned}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
