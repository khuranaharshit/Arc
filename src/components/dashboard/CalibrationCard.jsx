import { useState } from 'react';
import { Target, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';

// Mock — will be replaced by calibration config + CalibrationDAO
const MOCK_QUESTION = {
  key: 'cal_001',
  statement: 'The Great Wall of China is visible from space with the naked eye',
  answer: false,
  source: 'NASA has confirmed it is not visible from low Earth orbit without aid',
};

const CONFIDENCE_LEVELS = [50, 60, 70, 80, 90, 100];

export function CalibrationCard() {
  const [confidence, setConfidence] = useState(null);
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const q = MOCK_QUESTION;

  const handleSubmit = (isTrue) => {
    setGuess(isTrue);
    setRevealed(true);
  };

  const isCorrect = guess === q.answer;

  return (
    <Card>
      <CardHeader title="Calibration" icon={Target} subtitle="How sure are you?" />

      <p className="mb-3 text-sm text-slate-200">"{q.statement}"</p>

      {!revealed ? (
        <>
          {/* True/False buttons */}
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => handleSubmit(true)}
              className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              True
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
            >
              False
            </button>
          </div>

          {/* Confidence slider */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-500">Confidence</label>
            <div className="flex gap-1">
              {CONFIDENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setConfidence(lvl)}
                  className={`flex-1 rounded py-1 text-xs font-medium transition-all ${
                    confidence === lvl
                      ? 'bg-primary text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {lvl}%
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
            <span className={`text-sm font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correct!' : 'Wrong!'}
            </span>
            <span className="text-sm text-slate-400">
              — Answer: {q.answer ? 'True' : 'False'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{q.source}</p>
        </div>
      )}
    </Card>
  );
}
