/**
 * GameEngine — manages a game session: timing, scoring, XP calculation.
 * Used by game components to standardize session flow.
 */
export class GameEngine {
  constructor({ gameType, section, questions, timeLimit = null }) {
    this.gameType = gameType;
    this.section = section; // 'practice' | 'puzzles' | 'speed'
    this.questions = questions;
    this.timeLimit = timeLimit;
    this.timeElapsed = 0;
    this.score = 0;
    this.maxScore = questions.length;
    this.currentIndex = 0;
    this.status = 'ready'; // 'ready' | 'playing' | 'finished'
    this._timer = null;
  }

  start() {
    this.status = 'playing';
    this.score = 0;
    this.timeElapsed = 0;
    this.currentIndex = 0;
    this._startTimer();
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  submitAnswer(answer) {
    const q = this.getCurrentQuestion();
    if (!q || this.status !== 'playing') return { correct: false };

    const correct = String(answer) === String(q.answer);
    if (correct) this.score++;

    return { correct, explanation: q.explanation };
  }

  next() {
    if (this.currentIndex + 1 >= this.questions.length) {
      return this.finish();
    }
    this.currentIndex++;
    return { finished: false };
  }

  skip() {
    return this.next();
  }

  finish() {
    this.status = 'finished';
    this._stopTimer();
    const xpEarned = this._calculateXP();
    return {
      finished: true,
      score: this.score,
      maxScore: this.maxScore,
      timeElapsed: this.timeElapsed,
      xpEarned,
    };
  }

  getTimeRemaining() {
    if (!this.timeLimit) return null;
    return Math.max(0, this.timeLimit - this.timeElapsed);
  }

  _startTimer() {
    this._timer = setInterval(() => {
      this.timeElapsed++;
      if (this.timeLimit && this.timeElapsed >= this.timeLimit) {
        this.finish();
      }
    }, 1000);
  }

  _stopTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  _calculateXP() {
    const ratio = this.maxScore > 0 ? this.score / this.maxScore : 0;
    const baseXP = { practice: 6, puzzles: 8, speed: 10 }[this.section] || 6;
    return Math.max(2, Math.round(baseXP * ratio));
  }
}
