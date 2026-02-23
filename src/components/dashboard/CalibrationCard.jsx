import { useState } from 'react';
import { Target, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useToast } from '../../context/ToastContext';

const Q = { statement: 'The Great Wall of China is visible from space with the naked eye', answer: false, source: 'NASA has confirmed it is not visible from low Earth orbit without aid' };
const LEVELS = [50, 60, 70, 80, 90, 100];

export function CalibrationCard() {
  const [confidence, setConfidence] = useState(null);
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (isTrue) => { setGuess(isTrue); setRevealed(true); if (isTrue === Q.answer) addToast('+2 XP — Calibration correct!', 'xp'); };
  const isCorrect = guess === Q.answer;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-cyan-500/8 blur-2xl" />
      <CardHeader title="Calibration" icon={Target} subtitle="How sure are you?" />
      <p className="mb-3 text-sm t-secondary">"{Q.statement}"</p>
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
            <span className="text-sm t-muted">— Answer: {Q.answer ? 'True' : 'False'}</span>
          </div>
          <p className="mt-2 text-xs t-muted">{Q.source}</p>
        </div>
      )}
    </Card>
  );
}
