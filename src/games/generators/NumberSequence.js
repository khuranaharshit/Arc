/**
 * Generates number sequence puzzles algorithmically.
 * Difficulty 1-5 scales from simple arithmetic to compound rules.
 */

const RULES = [
  // Difficulty 1: constant addition
  (d) => { const step = 2 + d; const start = Math.floor(Math.random() * 5) + 1; return { seq: Array.from({ length: 6 }, (_, i) => start + step * i), rule: `Add ${step} each time` }; },
  // Difficulty 2: constant multiplication
  (d) => { const mult = 2 + Math.floor(d / 2); const start = Math.floor(Math.random() * 3) + 1; return { seq: Array.from({ length: 6 }, (_, i) => start * Math.pow(mult, i)), rule: `Multiply by ${mult}` }; },
  // Difficulty 3: squares
  (d) => { const offset = Math.floor(Math.random() * 3); return { seq: Array.from({ length: 6 }, (_, i) => (i + 1 + offset) ** 2), rule: 'Perfect squares' }; },
  // Difficulty 3: increasing differences
  (d) => { const seq = [1]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i + 1) * (1 + Math.floor(d / 3))); return { seq, rule: 'Increasing differences' }; },
  // Difficulty 4: fibonacci-like
  (d) => { const a = 1 + Math.floor(Math.random() * 3); const b = a + 1 + Math.floor(Math.random() * 3); const seq = [a, b]; for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]); return { seq, rule: 'Each = sum of previous two' }; },
  // Difficulty 5: alternating operations
  (d) => { const seq = [2]; for (let i = 1; i < 6; i++) seq.push(i % 2 === 1 ? seq[i - 1] * 2 : seq[i - 1] + 3); return { seq, rule: 'Alternating: ×2, +3' }; },
];

export function generate(difficulty = 3) {
  const pool = RULES.slice(0, Math.min(RULES.length, 1 + difficulty));
  const rule = pool[Math.floor(Math.random() * pool.length)];
  const { seq, rule: explanation } = rule(difficulty);

  const answer = seq[5];
  const shown = seq.slice(0, 5);

  // Generate wrong options near the answer
  const options = new Set([answer]);
  while (options.size < 4) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    options.add(answer + offset);
  }

  const shuffled = [...options].sort(() => Math.random() - 0.5);

  return {
    prompt: `What comes next? ${shown.join(', ')}, ?`,
    options: shuffled.map(String),
    answer: String(answer),
    explanation,
    difficulty,
  };
}
