import { useState, useEffect } from 'react';
import { Smile, Battery, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

const ENERGY = [
  { value: 1, label: 'Drained' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Energized' },
  { value: 5, label: 'Peak' },
];

export function MoodLogger() {
  const { moodDAO } = useData();
  const { addToast } = useToast();
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [note, setNote] = useState('');
  const [todayEntry, setTodayEntry] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    moodDAO.getTodayMood().then((e) => {
      setTodayEntry(e);
      if (e) { setMood(e.mood); setEnergy(e.energy); setNote(e.note); }
    });
    moodDAO.getHistory(14).then(setHistory);
  }, [moodDAO]);

  const handleSave = async () => {
    if (!mood || !energy) return addToast('Select both mood and energy', 'error');
    await moodDAO.logMood(mood, energy, note);
    addToast(todayEntry ? 'Mood updated!' : 'Mood logged!', 'success');
    setTodayEntry({ mood, energy, note });
    setHistory(await moodDAO.getHistory(14));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Mood</h1>
        <p className="text-sm t-muted">Track your mood & energy daily.</p>
      </div>

      <Card>
        <CardHeader title="How are you feeling?" icon={Smile} />
        <div className="flex justify-between gap-2 mb-4">
          {MOODS.map((m) => (
            <button key={m.value} onClick={() => setMood(m.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 transition-all active:scale-[0.95] ${
                mood === m.value ? 'bg-purple-500/15 ring-2 ring-purple-500/40' : ''
              }`}
              style={mood !== m.value ? { background: 'var(--color-surface-row)' } : {}}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] t-muted">{m.label}</span>
            </button>
          ))}
        </div>

        <CardHeader title="Energy level" icon={Battery} />
        <div className="flex gap-1.5 mb-4">
          {ENERGY.map((e) => (
            <button key={e.value} onClick={() => setEnergy(e.value)}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all active:scale-[0.95] ${
                energy === e.value ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 't-muted'
              }`}
              style={energy !== e.value ? { background: 'var(--color-surface-row)' } : {}}>
              {e.value}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium t-secondary mb-1">Note (optional)</label>
          <input type="text" className="input-field" placeholder="How did the day go?" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button onClick={handleSave} className="btn-primary w-full">
          {todayEntry ? 'Update' : 'Log'} Mood
        </button>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader title="Recent" icon={Smile} subtitle="Last 14 days" />
          <div className="flex gap-1.5">
            {history.slice(-14).map((e) => (
              <div key={e.date} className="flex flex-1 flex-col items-center gap-1" title={`${e.date}: mood ${e.mood}, energy ${e.energy}`}>
                <span className="text-lg">{MOODS.find((m) => m.value === e.mood)?.emoji || '·'}</span>
                <div className="h-6 w-full rounded-md relative overflow-hidden" style={{ background: 'var(--color-surface-row)' }}>
                  <div className="absolute bottom-0 w-full rounded-md bg-purple-500/40" style={{ height: `${(e.energy / 5) * 100}%` }} />
                </div>
                <span className="text-[8px] t-faint">{e.date.slice(8)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
