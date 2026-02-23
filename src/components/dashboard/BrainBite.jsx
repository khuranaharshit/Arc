import { useState, useCallback } from 'react';
import { Brain, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useToast } from '../../context/ToastContext';

// Pool of puzzles — will grow with game generators later
const PUZZLES = [
  { prompt: 'What comes next? 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '48'], answer: '42', explanation: 'Differences: 4, 6, 8, 10, 12 — next = 30 + 12 = 42' },
  { prompt: 'What comes next? 1, 1, 2, 3, 5, 8, ?', options: ['11', '12', '13', '15'], answer: '13', explanation: 'Fibonacci: each = sum of previous two → 5 + 8 = 13' },
  { prompt: 'What comes next? 3, 9, 27, 81, ?', options: ['162', '216', '243', '324'], answer: '243', explanation: 'Geometric: multiply by 3 → 81 × 3 = 243' },
  { prompt: 'What comes next? 1, 4, 9, 16, 25, ?', options: ['30', '33', '36', '49'], answer: '36', explanation: 'Perfect squares: 1², 2², 3², 4², 5², 6² = 36' },
  { prompt: 'What comes next? 2, 3, 5, 7, 11, 13, ?', options: ['15', '16', '17', '19'], answer: '17', explanation: 'Prime numbers — next prime after 13 is 17' },
  { prompt: 'What comes next? 0, 1, 1, 2, 4, 7, 13, ?', options: ['20', '22', '24', '26'], answer: '24', explanation: 'Tribonacci: each = sum of previous three → 4 + 7 + 13 = 24' },
  { prompt: 'A > B, B > C, D > A. Rank highest to lowest.', options: ['D, A, B, C', 'A, D, B, C', 'D, B, A, C', 'A, B, D, C'], answer: 'D, A, B, C', explanation: 'D > A > B > C' },
  { prompt: 'Flip 2 coins. P(both heads)?', options: ['1/2', '1/3', '1/4', '1/6'], answer: '1/4', explanation: 'P(H) × P(H) = 1/2 × 1/2 = 1/4' },
  { prompt: 'Roughly: 347 × 28 = ?', options: ['~5,000', '~7,500', '~10,000', '~12,500'], answer: '~10,000', explanation: '347 × 28 = 9,716 ≈ 10,000' },
  { prompt: 'Roll a die. P(even)?', options: ['1/3', '1/2', '2/3', '1/6'], answer: '1/2', explanation: '3 even (2,4,6) out of 6 = 1/2' },
];

function pickRandom(exclude = -1) {
  let idx;
  do { idx = Math.floor(Math.random() * PUZZLES.length); } while (idx === exclude && PUZZLES.length > 1);
  return idx;
}

export function BrainBite() {
  const [puzzleIdx, setPuzzleIdx] = useState(() => pickRandom());
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const { addToast } = useToast();

  const puzzle = PUZZLES[puzzleIdx];

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    if (opt === puzzle.answer) addToast('+3 XP — Brain Bite solved!', 'xp');
  };

  const refresh = useCallback(() => {
    setPuzzleIdx((prev) => pickRandom(prev));
    setSelected(null);
    setRevealed(false);
  }, []);

  const isCorrect = selected === puzzle.answer;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-pink-500/8 blur-2xl" />
      <CardHeader title="Brain Bite" icon={Brain} subtitle="Daily puzzle"
        action={
          <button onClick={refresh} className="rounded-lg p-1.5 t-muted hover:t-secondary transition-colors" title="New puzzle">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        }
      />
      <p className="mb-3 text-sm font-medium t-secondary">{puzzle.prompt}</p>
      <div className="grid grid-cols-2 gap-2">
        {puzzle.options.map((opt) => {
          let cls = 't-tertiary hover:t-secondary';
          let border = 'var(--color-border)';
          let bg = 'var(--color-surface-row)';
          if (revealed && opt === puzzle.answer) { cls = 'text-emerald-400'; border = 'rgba(16,185,129,0.4)'; bg = 'rgba(16,185,129,0.1)'; }
          else if (revealed && opt === selected && !isCorrect) { cls = 'text-red-400'; border = 'rgba(239,68,68,0.4)'; bg = 'rgba(239,68,68,0.1)'; }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={revealed}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${cls}`}
              style={{ borderColor: border, background: bg }}>
              {opt}
              {revealed && opt === puzzle.answer && <CheckCircle className="ml-1.5 inline h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-3 rounded-xl p-3 animate-fade-in" style={{ background: 'var(--color-surface-row)' }}>
          <p className="text-xs t-tertiary">{puzzle.explanation}</p>
          <div className="flex items-center justify-between mt-2">
            {isCorrect && <p className="text-xs font-semibold text-emerald-400">+3 XP earned!</p>}
            <button onClick={refresh} className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors ml-auto">
              Next puzzle →
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
