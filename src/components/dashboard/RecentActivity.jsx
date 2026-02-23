import { Clock, Zap, Sparkles } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';

const ACTIVITIES = [
  { id: '1', label: 'Exercise (30+ min)', category: 'body', xp: 9.6, criticalHit: false, time: '6:30 AM' },
  { id: '2', label: 'Brilliant.org lesson', category: 'mind', xp: 6, criticalHit: false, time: '7:15 AM' },
  { id: '3', label: '1 LeetCode problem', category: 'mind', xp: 16, criticalHit: true, time: '8:00 AM' },
  { id: '4', label: 'Read physical book (20+ min)', category: 'learning', xp: 6, criticalHit: false, time: '9:30 AM' },
  { id: '5', label: 'No phone first 30 min', category: 'body', xp: 3, criticalHit: false, time: '6:00 AM' },
];
const DOT = { body: '#f43f5e', mind: '#a855f7', learning: '#3b82f6', communication: '#f59e0b', technical: '#10b981', social: '#ec4899', discipline: '#6366f1' };

export function RecentActivity() {
  return (
    <Card className="col-span-full">
      <CardHeader title="Recent Activity" icon={Clock} subtitle="Today" />
      <div className="space-y-1.5">
        {ACTIVITIES.map((act) => (
          <div key={act.id} className="surface-row">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full" style={{ background: DOT[act.category] }} />
              <span className="text-sm t-secondary">{act.label}</span>
              {act.criticalHit && <Badge color="warning" icon={Sparkles}>Crit!</Badge>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs t-faint">{act.time}</span>
              <span className="flex items-center gap-1 text-sm font-bold text-purple-400">
                <Zap className="h-3 w-3" />+{act.xp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
