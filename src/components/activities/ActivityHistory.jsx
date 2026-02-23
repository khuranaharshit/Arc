import { useState, useEffect } from 'react';
import { History, Zap, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { useData } from '../../context/DataContext';
import { getToday, formatDate, relativeDate } from '../../utils/dates';

const DOT = { body: '#f43f5e', mind: '#a855f7', learning: '#3b82f6', communication: '#f59e0b', technical: '#10b981', social: '#ec4899', discipline: '#6366f1' };

export function ActivityHistory() {
  const { activityDAO, config } = useData();
  const [days, setDays] = useState({});
  const [offset, setOffset] = useState(0); // 0 = current page (last 7 days)

  const activityMap = {};
  config.xpMenu.activities.forEach((a) => { activityMap[a.key] = a.label; });

  useEffect(() => {
    activityDAO.getData().then((data) => setDays(data.days || {}));
  }, [activityDAO]);

  // Get 7 days based on offset
  const dateRange = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i - offset * 7);
    dateRange.push(formatDate(d));
  }

  const hasData = dateRange.some((d) => days[d]?.activities?.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Activity History</h1>
        <p className="text-sm t-muted">Browse your past activities.</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setOffset((o) => o + 1)} className="btn-ghost text-xs">
          <ChevronLeft className="h-4 w-4" /> Older
        </button>
        <span className="text-sm font-medium t-secondary">
          {relativeDate(dateRange[0])} — {relativeDate(dateRange[6])}
        </span>
        <button onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} className="btn-ghost text-xs" style={offset === 0 ? { opacity: 0.3 } : {}}>
          Newer <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {!hasData && (
        <Card>
          <p className="text-center text-sm t-muted py-8">No activities logged in this period.</p>
        </Card>
      )}

      {dateRange.map((date) => {
        const day = days[date];
        if (!day?.activities?.length) return null;
        return (
          <Card key={date}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold t-primary">{relativeDate(date)}</h3>
              <div className="flex items-center gap-2">
                <Badge color="primary" icon={Zap}>{Math.round(day.xp_total)} XP</Badge>
                <span className="text-xs t-muted">{day.activities.length} activities</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {day.activities.map((act) => (
                <div key={act.id} className="surface-row">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ background: DOT[act.category] }} />
                    <span className="text-sm t-secondary">{activityMap[act.activity_key] || act.activity_key}</span>
                    {act.critical_hit && <Badge color="warning" icon={Sparkles}>Crit!</Badge>}
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold text-purple-400">
                    <Zap className="h-3 w-3" />+{act.xp_earned}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
