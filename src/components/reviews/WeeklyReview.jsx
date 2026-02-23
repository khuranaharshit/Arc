import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useToast } from '../../context/ToastContext';

const AREAS = ['Health & Body', 'Focus & Productivity', 'Logic & Problem Solving', 'Learning & Reading', 'Relationships'];

export function WeeklyReview() {
  const [scores, setScores] = useState({});
  const [win, setWin] = useState('');
  const [fix, setFix] = useState('');
  const [book, setBook] = useState('');
  const { addToast } = useToast();

  const handleSubmit = () => {
    addToast('Weekly review submitted! +5 XP', 'xp');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Weekly Review</h1>
        <p className="text-sm text-white/30">Reflect on your week.</p>
      </div>

      <Card>
        <CardHeader title="Week 8 Review" icon={ClipboardCheck} subtitle="Feb 17 - Feb 23, 2026" />
        <div className="space-y-5">
          {AREAS.map((area) => (
            <div key={area}>
              <label className="mb-2 block text-sm font-medium text-white/60">{area}</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setScores((s) => ({ ...s, [area]: n }))}
                    className={`flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-[0.95] ${
                      scores[area] === n
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/30 hover:bg-white/[0.06] hover:text-white/50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">Biggest win this week</label>
            <input type="text" className="input-field" placeholder="What went well?" value={win} onChange={(e) => setWin(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">One thing to fix next week</label>
            <input type="text" className="input-field" placeholder="What needs improvement?" value={fix} onChange={(e) => setFix(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">Current book</label>
            <input type="text" className="input-field" placeholder="What are you reading?" value={book} onChange={(e) => setBook(e.target.value)} />
          </div>

          <button onClick={handleSubmit} className="btn-primary w-full">Submit Review</button>
        </div>
      </Card>
    </div>
  );
}
