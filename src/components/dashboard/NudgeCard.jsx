import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ConfigLoader } from '../../dao/ConfigLoader';

export function NudgeCard() {
  const [nudges, setNudges] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    ConfigLoader.nudges().then((cfg) => {
      const all = Object.values(cfg.categories).flat();
      setNudges(all);
      if (all.length > 0) setCurrent(all[Math.floor(Math.random() * all.length)]);
    });
  }, []);

  const refresh = useCallback(() => {
    if (nudges.length === 0) return;
    setCurrent(nudges[Math.floor(Math.random() * nudges.length)]);
  }, [nudges]);

  if (!current) return null;

  return (
    <Card className="relative overflow-hidden border-l-2 border-l-purple-500/50">
      <CardHeader title="Daily Nudge" icon={MessageCircle} subtitle="Pause and reflect"
        action={
          <button onClick={refresh} className="rounded-lg p-1.5 t-muted hover:t-secondary transition-colors" title="New nudge">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        }
      />
      <p className="text-sm italic t-secondary leading-relaxed">"{current}"</p>
    </Card>
  );
}
