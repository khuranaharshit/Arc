import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Clock, RotateCcw, CheckCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useToast } from '../../context/ToastContext';

// Mock game data per type
const GAME_DATA = {
  number_sequence: {
    name: 'Number Sequences',
    icon: '🔢',
    questions: [
      { prompt: 'What comes next? 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '48'], answer: '42', explanation: 'Differences: 4, 6, 8, 10, 12' },
      { prompt: 'What comes next? 1, 1, 2, 3, 5, 8, ?', options: ['11', '12', '13', '15'], answer: '13', explanation: 'Fibonacci: each number = sum of previous two' },
      { prompt: 'What comes next? 3, 9, 27, 81, ?', options: ['162', '216', '243', '324'], answer: '243', explanation: 'Geometric: multiply by 3' },
    ],
  },
  logical_deduction: {
    name: 'Logical Deduction',
    icon: '🧩',
    questions: [
      { prompt: 'A > B, B > C, D > A. Rank highest to lowest.', options: ['D, A, B, C', 'A, D, B, C', 'D, B, A, C', 'A, B, D, C'], answer: 'D, A, B, C', explanation: 'D > A > B > C' },
      { prompt: 'X is taller than Y. Z is shorter than Y. W is taller than X. Who is shortest?', options: ['X', 'Y', 'Z', 'W'], answer: 'Z', explanation: 'W > X > Y > Z' },
    ],
  },
  estimation: {
    name: 'Estimation',
    icon: '🧮',
    questions: [
      { prompt: 'Roughly: 347 x 28 = ?', options: ['~5,000', '~7,500', '~10,000', '~12,500'], answer: '~10,000', explanation: '347 x 28 = 9,716 ≈ 10,000' },
      { prompt: 'Roughly: 8,742 / 43 = ?', options: ['~100', '~200', '~300', '~400'], answer: '~200', explanation: '8,742 / 43 ≈ 203' },
    ],
  },
  calibration: {
    name: 'Calibration',
    icon: '🎯',
    questions: [
      { prompt: 'True or False: "Humans use only 10% of their brains"', options: ['True', 'False'], answer: 'False', explanation: 'This is a myth — brain scans show activity throughout the brain' },
      { prompt: 'True or False: "Goldfish have a 3-second memory"', options: ['True', 'False'], answer: 'False', explanation: 'Goldfish can remember things for months' },
    ],
  },
  fermi: {
    name: 'Fermi Estimates',
    icon: '📏',
    questions: [
      { prompt: 'How many piano tuners are in Chicago?', options: ['~25', '~225', '~2,250', '~22,500'], answer: '~225', explanation: '~2.7M people, ~100K pianos, tuned 1x/year, tuner does ~4/day x 250 days = 1000/year → ~100 tuners. Actual: ~225.' },
    ],
  },
  logic_riddle: {
    name: 'Logic Riddles',
    icon: '💡',
    questions: [
      { prompt: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', options: ['Shadow', 'Echo', 'Thought', 'Dream'], answer: 'Echo', explanation: 'An echo "speaks" (reflects sound) and "hears" (is caused by sound), comes alive with wind carrying sound.' },
    ],
  },
  trivia: {
    name: 'Trivia Quiz',
    icon: '❓',
    questions: [
      { prompt: 'Which element has the chemical symbol "Au"?', options: ['Silver', 'Gold', 'Aluminum', 'Argon'], answer: 'Gold', explanation: 'Au comes from the Latin "aurum"' },
      { prompt: 'What is the speed of light (approx)?', options: ['300 km/s', '30,000 km/s', '300,000 km/s', '3,000,000 km/s'], answer: '300,000 km/s', explanation: 'c ≈ 299,792 km/s' },
    ],
  },
  memory_grid: {
    name: 'Memory Grid',
    icon: '🔲',
    questions: [
      { prompt: 'Remember: the highlighted cells were at positions 1, 4, 5, 9 in a 3x3 grid. Which positions were highlighted?', options: ['1, 4, 5, 9', '2, 3, 6, 8', '1, 3, 7, 9', '2, 5, 6, 8'], answer: '1, 4, 5, 9', explanation: 'Trust your memory!' },
    ],
  },
  probability_snap: {
    name: 'Probability Snap',
    icon: '🎲',
    questions: [
      { prompt: 'You flip 2 coins. What is P(both heads)?', options: ['1/2', '1/3', '1/4', '1/6'], answer: '1/4', explanation: 'P(H) x P(H) = 1/2 x 1/2 = 1/4' },
      { prompt: 'Roll a standard die. P(even number)?', options: ['1/3', '1/2', '2/3', '1/6'], answer: '1/2', explanation: '3 even numbers (2,4,6) out of 6 = 1/2' },
    ],
  },
  speed_trivia: {
    name: 'Speed Trivia',
    icon: '⚡',
    questions: [
      { prompt: 'What is the largest planet in our solar system?', options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'], answer: 'Jupiter', explanation: 'Jupiter is the largest, with a mass of 1.898 × 10^27 kg' },
    ],
  },
};

export function GameSession() {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const game = GAME_DATA[gameType];

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [finished]);

  if (!game) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20">
        <p className="text-white/40">Game not found.</p>
        <button onClick={() => navigate('/games')} className="btn-primary">Back to Games</button>
      </div>
    );
  }

  const questions = game.questions;
  const q = questions[qIndex];
  const total = questions.length;

  const handleAnswer = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    if (opt === q.answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (qIndex + 1 >= total) {
      setFinished(true);
      const xpEarned = Math.round((score + (selected === q.answer ? 1 : 0)) / total * 8);
      addToast(`+${xpEarned} XP — ${game.name} complete!`, 'xp');
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  if (finished) {
    const finalScore = score + (selected === q?.answer ? 1 : 0);
    const xpEarned = Math.round(finalScore / total * 8);
    return (
      <div className="flex flex-col items-center gap-6 pt-10 animate-fade-in">
        <span className="text-6xl">{game.icon}</span>
        <h2 className="text-2xl font-bold text-white">{game.name}</h2>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-white">{finalScore}/{total}</p>
            <p className="text-xs text-white/30">Score</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-purple-400">+{xpEarned}</p>
            <p className="text-xs text-white/30">XP Earned</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-white/60">{mins}:{String(secs).padStart(2, '0')}</p>
            <p className="text-xs text-white/30">Time</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/games')} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={() => {
              setQIndex(0); setSelected(null); setRevealed(false);
              setScore(0); setFinished(false); setTimer(0);
            }}
            className="btn-primary"
          >
            <RotateCcw className="h-4 w-4" /> Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/games')}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <Badge color="primary">{qIndex + 1}/{total}</Badge>
          <div className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-1.5 font-mono text-sm text-white/50">
            <Clock className="h-3.5 w-3.5" />
            {mins}:{String(secs).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Game card */}
      <Card glow>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{game.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-white">{game.name}</h2>
            <p className="text-xs text-white/30">Question {qIndex + 1} of {total}</p>
          </div>
        </div>

        <p className="mb-6 text-base font-medium text-white/80">{q.prompt}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((opt) => {
            let style = 'border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:border-white/10';
            if (revealed && opt === q.answer) {
              style = 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300';
            } else if (revealed && opt === selected && opt !== q.answer) {
              style = 'border-red-500/40 bg-red-500/15 text-red-300';
            }
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={revealed}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all active:scale-[0.97] ${style}`}
              >
                {opt}
                {revealed && opt === q.answer && <CheckCircle className="ml-2 inline h-4 w-4" />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-xs text-white/40">{q.explanation}</p>
            </div>
            <button onClick={handleNext} className="btn-primary w-full">
              {qIndex + 1 >= total ? 'Finish' : 'Next Question'}
            </button>
          </div>
        )}
      </Card>

      {/* Score bar */}
      <div className="flex items-center gap-3 text-sm text-white/30">
        <Zap className="h-4 w-4 text-purple-400" />
        <span>Score: {score}/{qIndex + (revealed ? 1 : 0)}</span>
      </div>
    </div>
  );
}
