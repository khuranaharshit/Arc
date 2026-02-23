import { useState } from 'react';
import { Brain, CheckCircle } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useToast } from '../../context/ToastContext';

const MOCK_PUZZLE = {
  type: 'number_sequence',
  prompt: 'What comes next? 2, 6, 12, 20, 30, ?',
  options: ['40', '42', '44', '48'],
  answer: '42',
  explanation: 'Differences: 4, 6, 8, 10, 12 — next term = 30 + 12 = 42',
};

export function BrainBite() {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const { addToast } = useToast();
  const puzzle = MOCK_PUZZLE;

  const handleSelect = (option) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    if (option === puzzle.answer) {
      addToast('+3 XP — Brain Bite solved!', 'xp');
    }
  };

  const isCorrect = selected === puzzle.answer;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-pink-500/8 blur-2xl" />
      <CardHeader title="Brain Bite" icon={Brain} subtitle="Daily puzzle" />
      <p className="mb-3 text-sm font-medium text-white/80">{puzzle.prompt}</p>

      <div className="grid grid-cols-2 gap-2">
        {puzzle.options.map((opt) => {
          let style = 'border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/80';
          if (revealed && opt === puzzle.answer) {
            style = 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300';
          } else if (revealed && opt === selected && !isCorrect) {
            style = 'border-red-500/40 bg-red-500/15 text-red-300';
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={revealed}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${style}`}
            >
              {opt}
              {revealed && opt === puzzle.answer && <CheckCircle className="ml-1.5 inline h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-3 rounded-xl bg-white/[0.03] p-3 animate-fade-in">
          <p className="text-xs text-white/40">{puzzle.explanation}</p>
          {isCorrect && <p className="mt-1 text-xs font-semibold text-emerald-400">+3 XP earned!</p>}
        </div>
      )}
    </Card>
  );
}
