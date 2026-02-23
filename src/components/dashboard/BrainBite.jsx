import { useState } from 'react';
import { Brain, CheckCircle } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useToast } from '../../context/ToastContext';

const MOCK_PUZZLE = {
  prompt: 'What comes next? 2, 6, 12, 20, 30, ?',
  options: ['40', '42', '44', '48'],
  answer: '42',
  explanation: 'Differences: 4, 6, 8, 10, 12 — next term = 30 + 12 = 42',
};

export function BrainBite() {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const { addToast } = useToast();

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    if (opt === MOCK_PUZZLE.answer) addToast('+3 XP — Brain Bite solved!', 'xp');
  };

  const isCorrect = selected === MOCK_PUZZLE.answer;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-pink-500/8 blur-2xl" />
      <CardHeader title="Brain Bite" icon={Brain} subtitle="Daily puzzle" />
      <p className="mb-3 text-sm font-medium t-secondary">{MOCK_PUZZLE.prompt}</p>
      <div className="grid grid-cols-2 gap-2">
        {MOCK_PUZZLE.options.map((opt) => {
          let cls = 't-tertiary hover:t-secondary';
          let border = 'var(--color-border)';
          let bg = 'var(--color-surface-row)';
          if (revealed && opt === MOCK_PUZZLE.answer) { cls = 'text-emerald-400'; border = 'rgba(16,185,129,0.4)'; bg = 'rgba(16,185,129,0.1)'; }
          else if (revealed && opt === selected && !isCorrect) { cls = 'text-red-400'; border = 'rgba(239,68,68,0.4)'; bg = 'rgba(239,68,68,0.1)'; }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={revealed}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${cls}`}
              style={{ borderColor: border, background: bg }}>
              {opt}
              {revealed && opt === MOCK_PUZZLE.answer && <CheckCircle className="ml-1.5 inline h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-3 rounded-xl p-3 animate-fade-in" style={{ background: 'var(--color-surface-row)' }}>
          <p className="text-xs t-tertiary">{MOCK_PUZZLE.explanation}</p>
          {isCorrect && <p className="mt-1 text-xs font-semibold text-emerald-400">+3 XP earned!</p>}
        </div>
      )}
    </Card>
  );
}
