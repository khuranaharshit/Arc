/**
 * Generates estimation/mental math problems.
 * Shows 4 options at different magnitudes.
 */

export function generate(difficulty = 3) {
  const ops = [
    () => { const a = rand(10, 50 * difficulty); const b = rand(5, 20 * difficulty); return { expr: `${a} × ${b}`, answer: a * b }; },
    () => { const a = rand(100, 500 * difficulty); const b = rand(3, 10 + difficulty); return { expr: `${a} ÷ ${b}`, answer: Math.round(a / b) }; },
    () => { const a = rand(50, 200 * difficulty); const b = rand(50, 200 * difficulty); return { expr: `${a} + ${b}`, answer: a + b }; },
    () => { const a = rand(100 * difficulty, 1000 * difficulty); const b = rand(10, 50 * difficulty); return { expr: `${a} × ${b}`, answer: a * b }; },
  ];

  const op = ops[Math.min(Math.floor(Math.random() * ops.length), difficulty - 1)];
  const { expr, answer } = op();

  // Round answer for display
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(answer) || 1)));
  const rounded = Math.round(answer / magnitude) * magnitude;

  // Generate options at different nearby values
  const options = new Set([`~${rounded.toLocaleString()}`]);
  const multipliers = [0.5, 0.7, 1.5, 2, 0.3, 1.3];
  for (const m of multipliers) {
    if (options.size >= 4) break;
    const v = Math.round(rounded * m / magnitude) * magnitude;
    if (v > 0 && v !== rounded) options.add(`~${v.toLocaleString()}`);
  }
  // Fill if needed
  while (options.size < 4) {
    const v = rounded + magnitude * (Math.floor(Math.random() * 5) + 1);
    options.add(`~${v.toLocaleString()}`);
  }

  return {
    prompt: `Roughly: ${expr} = ?`,
    options: [...options].sort(() => Math.random() - 0.5),
    answer: `~${rounded.toLocaleString()}`,
    explanation: `${expr} = ${answer.toLocaleString()} ≈ ${rounded.toLocaleString()}`,
    difficulty,
  };
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
