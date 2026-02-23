import { useState } from 'react';
import { Brain, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';

// Mock puzzle — will be replaced by game generators
const MOCK_PUZZLE = {
  type: 'number_sequence',
  prompt: 'What comes next? 2, 6, 12, 20, 30, ?',
  options: ['40', '42', '44', '48'],
  answer: '42',
  explanation: 'Differences: 4, 6, 8, 10, 12 → next term = 30 + 12 = 42',
};

export function BrainBite() {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const puzzle = MOCK_PUZZLE;

  const handleSelect = (option) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
  };

  const isCorrect = selected === puzzle.answer;

  return (
    <Card>
      <CardHeader title="Brain Bite" icon={Brain} subtitle="Daily puzzle" />

      <p className="mb-3 text-sm font-medium text-slate-200">{puzzle.prompt}</p>

      <div className="grid grid-cols-2 gap-2">
        {puzzle.options.map((opt) => {
          let style = 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500';
          if (revealed && opt === puzzle.answer) {
            style = 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
          } else if (revealed && opt === selected && !isCorrect) {
            style = 'border-red-500 bg-red-500/20 text-red-300';
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={revealed}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${style}`}
            >
              {opt}
              {revealed && opt === puzzle.answer && (
                <CheckCircle className="ml-1 inline h-3.5 w-3.5" />
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-3 rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-400">{puzzle.explanation}</p>
          {isCorrect && (
            <p className="mt-1 text-xs font-semibold text-emerald-400">+3 XP earned!</p>
          )}
        </div>
      )}
    </Card>
  );
}
