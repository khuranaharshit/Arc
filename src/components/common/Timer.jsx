import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

export function Timer({ seconds, onComplete, running = true, className = '' }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, onComplete]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining <= 10;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-medium ${
        isLow ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-300'
      } ${className}`}
    >
      <Clock className="h-4 w-4" />
      {mins}:{String(secs).padStart(2, '0')}
    </div>
  );
}
