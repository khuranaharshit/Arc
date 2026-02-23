import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Clock, RotateCcw, CheckCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';

const GAME_DATA = {
  number_sequence: {
    name: 'Number Sequences', icon: '🔢', section: 'puzzles',
    questions: [
      { prompt: 'What comes next? 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '48'], answer: '42', explanation: 'Differences: 4, 6, 8, 10, 12' },
      { prompt: 'What comes next? 1, 1, 2, 3, 5, 8, ?', options: ['11', '12', '13', '15'], answer: '13', explanation: 'Fibonacci: each = sum of previous two' },
      { prompt: 'What comes next? 3, 9, 27, 81, ?', options: ['162', '216', '243', '324'], answer: '243', explanation: 'Geometric: multiply by 3' },
      { prompt: '1, 4, 9, 16, 25, ?', options: ['30', '33', '36', '49'], answer: '36', explanation: 'Perfect squares: 6² = 36' },
    ],
  },
  logical_deduction: {
    name: 'Logical Deduction', icon: '🧩', section: 'practice',
    questions: [
      { prompt: 'A > B, B > C, D > A. Rank highest to lowest.', options: ['D, A, B, C', 'A, D, B, C', 'D, B, A, C', 'A, B, D, C'], answer: 'D, A, B, C', explanation: 'D > A > B > C' },
      { prompt: 'X is taller than Y. Z is shorter than Y. W is taller than X. Shortest?', options: ['X', 'Y', 'Z', 'W'], answer: 'Z', explanation: 'W > X > Y > Z' },
      { prompt: 'P is faster than Q. R is slower than Q. S is faster than P. Fastest?', options: ['P', 'Q', 'R', 'S'], answer: 'S', explanation: 'S > P > Q > R' },
    ],
  },
  estimation: {
    name: 'Estimation', icon: '🧮', section: 'puzzles',
    questions: [
      { prompt: 'Roughly: 347 × 28 = ?', options: ['~5,000', '~7,500', '~10,000', '~12,500'], answer: '~10,000', explanation: '347 × 28 = 9,716 ≈ 10,000' },
      { prompt: 'Roughly: 8,742 ÷ 43 = ?', options: ['~100', '~200', '~300', '~400'], answer: '~200', explanation: '8,742 ÷ 43 ≈ 203' },
      { prompt: 'Roughly: 1,234 × 56 = ?', options: ['~35,000', '~50,000', '~70,000', '~90,000'], answer: '~70,000', explanation: '1,234 × 56 = 69,104 ≈ 70,000' },
    ],
  },
  calibration: {
    name: 'Calibration', icon: '🎯', section: 'practice',
    questions: [
      { prompt: '"Humans use only 10% of their brains"', options: ['True', 'False'], answer: 'False', explanation: 'Myth — brain scans show activity throughout' },
      { prompt: '"Goldfish have a 3-second memory"', options: ['True', 'False'], answer: 'False', explanation: 'Goldfish can remember things for months' },
      { prompt: '"Lightning never strikes the same place twice"', options: ['True', 'False'], answer: 'False', explanation: 'Tall structures like the Empire State are struck repeatedly' },
    ],
  },
  fermi: {
    name: 'Fermi Estimates', icon: '📏', section: 'practice',
    questions: [
      { prompt: 'How many piano tuners are in Chicago?', options: ['~25', '~225', '~2,250', '~22,500'], answer: '~225', explanation: '~2.7M people, ~100K pianos, tuned 1x/year, tuner does ~1000/year → ~100-225 tuners' },
      { prompt: 'How many golf balls fit in a school bus?', options: ['~5,000', '~50,000', '~500,000', '~5,000,000'], answer: '~500,000', explanation: 'Bus ~2.5m³ × 1e6 cm³/m³ ÷ ~40 cm³/ball ≈ 500,000' },
    ],
  },
  logic_riddle: {
    name: 'Logic Riddles', icon: '💡', section: 'puzzles',
    questions: [
      { prompt: 'I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?', options: ['Shadow', 'Echo', 'Thought', 'Dream'], answer: 'Echo', explanation: 'An echo reflects sound without a body' },
      { prompt: 'The more you take, the more you leave behind. What am I?', options: ['Time', 'Footsteps', 'Breath', 'Memories'], answer: 'Footsteps', explanation: 'Each step you take leaves one behind' },
    ],
  },
  trivia: {
    name: 'Trivia Quiz', icon: '❓', section: 'puzzles',
    questions: [
      { prompt: 'Which element has chemical symbol "Au"?', options: ['Silver', 'Gold', 'Aluminum', 'Argon'], answer: 'Gold', explanation: 'Au from Latin "aurum"' },
      { prompt: 'Speed of light (approx)?', options: ['300 km/s', '30,000 km/s', '300,000 km/s', '3,000,000 km/s'], answer: '300,000 km/s', explanation: 'c ≈ 299,792 km/s' },
      { prompt: 'Largest planet in our solar system?', options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'], answer: 'Jupiter', explanation: 'Jupiter mass = 1.898 × 10²⁷ kg' },
    ],
  },
  memory_grid: {
    name: 'Memory Grid', icon: '🔲', section: 'speed',
    questions: [
      { prompt: 'Positions 1, 4, 5, 9 were highlighted in a 3×3 grid. Which?', options: ['1, 4, 5, 9', '2, 3, 6, 8', '1, 3, 7, 9', '2, 5, 6, 8'], answer: '1, 4, 5, 9', explanation: 'Trust your memory!' },
    ],
  },
  probability_snap: {
    name: 'Probability Snap', icon: '🎲', section: 'speed',
    questions: [
      { prompt: 'Flip 2 coins. P(both heads)?', options: ['1/2', '1/3', '1/4', '1/6'], answer: '1/4', explanation: '1/2 × 1/2 = 1/4' },
      { prompt: 'Roll a die. P(even)?', options: ['1/3', '1/2', '2/3', '1/6'], answer: '1/2', explanation: '3 even out of 6' },
      { prompt: 'Draw 1 card from 52. P(heart)?', options: ['1/2', '1/4', '1/13', '1/52'], answer: '1/4', explanation: '13 hearts out of 52' },
    ],
  },
  speed_trivia: {
    name: 'Speed Trivia', icon: '⚡', section: 'speed',
    questions: [
      { prompt: 'Largest ocean on Earth?', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], answer: 'Pacific', explanation: 'Pacific covers ~165.25 million km²' },
      { prompt: 'How many bones in the adult human body?', options: ['106', '206', '306', '406'], answer: '206', explanation: 'Babies have ~270, which fuse to 206' },
    ],
  },
};

export function GameSession() {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { activityDAO, streakDAO, config } = useData();
  const game = GAME_DATA[gameType];

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const savedRef = useRef(false);

  useEffect(() => {
    if (finished) return;
    const iv = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [finished]);

  // Persist XP when game finishes
  useEffect(() => {
    if (!finished || savedRef.current || !game) return;
    savedRef.current = true;

    const finalScore = score + (selected === game.questions[qIndex]?.answer ? 1 : 0);
    const total = game.questions.length;
    const xpEarned = Math.max(2, Math.round((finalScore / total) * 8));

    (async () => {
      try {
        await activityDAO.logGame({
          game_type: gameType,
          section: game.section,
          score: finalScore,
          max_score: total,
          xp_earned: xpEarned,
          time_seconds: timer,
          timestamp: new Date().toISOString(),
        });
        const todayXP = await activityDAO.getTodayXP();
        await streakDAO.updateStreak(todayXP, config.streaks);
        addToast(`+${xpEarned} XP — ${game.name} complete!`, 'xp');
      } catch (err) {
        console.error('Failed to save game result:', err);
      }
    })();
  }, [finished]);

  if (!game) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20 animate-fade-in">
        <p className="t-muted">Game not found.</p>
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
    if (opt === q.answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (qIndex + 1 >= total) {
      setFinished(true);
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
    const xpEarned = Math.max(2, Math.round((finalScore / total) * 8));
    return (
      <div className="flex flex-col items-center gap-6 pt-10 animate-fade-in">
        <span className="text-6xl">{game.icon}</span>
        <h2 className="text-2xl font-bold t-primary">{game.name}</h2>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-extrabold t-primary">{finalScore}/{total}</p>
            <p className="text-xs t-muted">Score</p>
          </div>
          <div className="h-10 w-px" style={{ background: 'var(--color-border)' }} />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-purple-400">+{xpEarned}</p>
            <p className="text-xs t-muted">XP Earned</p>
          </div>
          <div className="h-10 w-px" style={{ background: 'var(--color-border)' }} />
          <div className="text-center">
            <p className="text-3xl font-extrabold t-tertiary">{mins}:{String(secs).padStart(2, '0')}</p>
            <p className="text-xs t-muted">Time</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/games')} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={() => { setQIndex(0); setSelected(null); setRevealed(false); setScore(0); setFinished(false); setTimer(0); savedRef.current = false; }} className="btn-primary">
            <RotateCcw className="h-4 w-4" /> Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/games')} className="flex items-center gap-2 text-sm t-muted hover:t-secondary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <Badge color="primary">{qIndex + 1}/{total}</Badge>
          <div className="flex items-center gap-1 rounded-xl px-3 py-1.5 font-mono text-sm t-tertiary" style={{ background: 'var(--color-surface-row)' }}>
            <Clock className="h-3.5 w-3.5" /> {mins}:{String(secs).padStart(2, '0')}
          </div>
        </div>
      </div>

      <Card glow>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{game.icon}</span>
          <div>
            <h2 className="text-lg font-bold t-primary">{game.name}</h2>
            <p className="text-xs t-muted">Question {qIndex + 1} of {total}</p>
          </div>
        </div>

        <p className="mb-6 text-base font-medium t-secondary">{q.prompt}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((opt) => {
            let cls = 't-tertiary hover:t-secondary';
            let border = 'var(--color-border)';
            let bg = 'var(--color-surface-row)';
            if (revealed && opt === q.answer) { cls = 'text-emerald-400'; border = 'rgba(16,185,129,0.4)'; bg = 'rgba(16,185,129,0.1)'; }
            else if (revealed && opt === selected && opt !== q.answer) { cls = 'text-red-400'; border = 'rgba(239,68,68,0.4)'; bg = 'rgba(239,68,68,0.1)'; }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} disabled={revealed}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all active:scale-[0.97] ${cls}`}
                style={{ borderColor: border, background: bg }}>
                {opt}
                {revealed && opt === q.answer && <CheckCircle className="ml-2 inline h-4 w-4" />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="rounded-xl p-3" style={{ background: 'var(--color-surface-row)' }}>
              <p className="text-xs t-tertiary">{q.explanation}</p>
            </div>
            <button onClick={handleNext} className="btn-primary w-full">
              {qIndex + 1 >= total ? 'Finish' : 'Next Question'}
            </button>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-3 text-sm t-muted">
        <Zap className="h-4 w-4 text-purple-400" />
        <span>Score: {score}/{qIndex + (revealed ? 1 : 0)}</span>
      </div>
    </div>
  );
}
