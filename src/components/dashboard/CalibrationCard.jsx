import { useState, useEffect, useCallback } from 'react';
import { Target, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useToast } from '../../context/ToastContext';
import { ConfigLoader } from '../../dao/ConfigLoader';

const LEVELS = [50, 60, 70, 80, 90, 100];

function pickRandom(arr, exclude = -1) {
  let idx;
  do { idx = Math.floor(Math.random() * arr.length); } while (idx === exclude && arr.length > 1);
  return idx;
}

export function CalibrationCard() {
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [confidence, setConfidence] = useState(null);
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    ConfigLoader.calibration().then((cfg) => setQuestions(cfg.questions));
  }, []);

  const q = questions[qIdx];

  const handleSubmit = (isTrue) => {
    setGuess(isTrue);
    setRevealed(true);
    if (q && isTrue === q.answer) addToast('+2 XP — Calibration correct!', 'xp');
  };

  const refresh = useCallback(() => {
    if (questions.length === 0) return;
    setQIdx((prev) => pickRandom(questions, prev));
    setConfidence(null);
    setGuess(null);
    setRevealed(false);
  }, [questions]);

  if (!q) return null;

  const isCorrect = guess === q.answer;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-cyan-500/8 blur-2xl" />
      <CardHeader title="Calibration" icon={Target} subtitle="How sure are you?"
        action={
          <button onClick={refresh} className="rounded-lg p-1.5 t-muted hover:t-secondary transition-colors" title="New question">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        }
      />
      <p className="mb-3 text-sm t-secondary">"{q.statement}"</p>
      {!revealed ? (
        <>
          <div className="mb-3 flex gap-2">
            <button onClick={() => handleSubmit(true)} className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-[0.97]">True</button>
            <button onClick={() => handleSubmit(false)} className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.97]">False</button>
          </div>
          <div>
            <label className="mb-1.5 block text-xs t-muted">Confidence</label>
            <div className="flex gap-1">
              {LEVELS.map((lvl) => (
                <button key={lvl} onClick={() => setConfidence(lvl)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                    confidence === lvl ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 't-muted'
                  }`}
                  style={confidence !== lvl ? { background: 'var(--color-surface-row)' } : {}}>
                  {lvl}%
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl p-3 animate-fade-in" style={{ background: 'var(--color-surface-row)' }}>
          <div className="flex items-center gap-2">
            {isCorrect ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
            <span className={`text-sm font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>{isCorrect ? 'Correct!' : 'Wrong!'}</span>
            <span className="text-sm t-muted">— Answer: {q.answer ? 'True' : 'False'}</span>
          </div>
          <p className="mt-2 text-xs t-muted">{q.source}</p>
          <button onClick={refresh} className="mt-2 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Next question →
          </button>
        </div>
      )}
    </Card>
  );
}
