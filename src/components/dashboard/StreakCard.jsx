import { useState, useEffect } from 'react';
import { Flame, Calendar } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { useData } from '../../context/DataContext';

export function StreakCard() {
  const { streakDAO } = useData();
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    const load = async () => {
      setStreak(await streakDAO.getCurrentStreak());
      setLongest(await streakDAO.getLongestStreak());
      setAlive(await streakDAO.isStreakAlive());
    };
    load();
    const iv = setInterval(load, 2000);
    return () => clearInterval(iv);
  }, [streakDAO]);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl" />
      <CardHeader title="Streak" icon={Flame}
        action={<Badge color={alive ? 'success' : 'danger'}>{alive ? 'Active' : streak > 0 ? 'At Risk' : 'Start one!'}</Badge>} />
      <div className="flex items-center gap-3">
        <Flame className={`h-9 w-9 ${alive ? 'text-orange-400 animate-streak-fire' : 't-faint'}`} />
        <div>
          <span className="text-3xl font-extrabold tabular-nums t-primary">{streak}</span>
          <span className="ml-1 text-sm t-muted">days</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs t-muted">
        <Calendar className="h-3 w-3" /><span>Best: {longest} days</span>
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: Math.max(14, streak) }, (_, i) => (
          <div key={i}
            className={`h-2 flex-1 rounded-full transition-all ${i < streak ? 'bg-gradient-to-r from-orange-500 to-amber-400' : ''}`}
            style={i < streak ? { opacity: 0.5 + (i / Math.max(14, streak)) * 0.5 } : { background: 'var(--color-surface-row)' }} />
        )).slice(0, 14)}
      </div>
    </Card>
  );
}
