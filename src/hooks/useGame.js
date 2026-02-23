import { useState, useCallback, useRef } from 'react';
import { GameEngine } from '../games/GameEngine';

/**
 * Game session hook — manages the lifecycle of a single game session.
 */
export function useGame() {
  const [engine, setEngine] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'playing' | 'finished'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const timerRef = useRef(0);

  const startGame = useCallback(({ gameType, section, questions, timeLimit }) => {
    const eng = new GameEngine({ gameType, section, questions, timeLimit });
    eng.start();
    setEngine(eng);
    setStatus('playing');
    setCurrentQuestion(eng.getCurrentQuestion());
    setScore(0);
    setQuestionIndex(0);
    setResult(null);
    return eng;
  }, []);

  const submitAnswer = useCallback((answer) => {
    if (!engine) return null;
    const res = engine.submitAnswer(answer);
    setScore(engine.score);
    return res;
  }, [engine]);

  const nextQuestion = useCallback(() => {
    if (!engine) return null;
    const res = engine.next();
    if (res.finished) {
      setStatus('finished');
      setResult(res);
    } else {
      setQuestionIndex(engine.currentIndex);
      setCurrentQuestion(engine.getCurrentQuestion());
    }
    return res;
  }, [engine]);

  const finishGame = useCallback(() => {
    if (!engine) return null;
    const res = engine.finish();
    setStatus('finished');
    setResult(res);
    return res;
  }, [engine]);

  return {
    status, currentQuestion, score, questionIndex, result,
    startGame, submitAnswer, nextQuestion, finishGame,
    totalQuestions: engine?.maxScore || 0,
    timeElapsed: engine?.timeElapsed || 0,
  };
}
