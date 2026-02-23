/**
 * Generates probability questions: coins, dice, cards.
 */

const GENERATORS = [
  // Coins
  (d) => {
    const n = 1 + Math.floor(d / 2);
    const total = Math.pow(2, n);
    const target = Math.floor(Math.random() * (n + 1));
    const ways = comb(n, target);
    const prob = simplify(ways, total);
    return {
      prompt: `Flip ${n} coin${n > 1 ? 's' : ''}. P(exactly ${target} heads)?`,
      answer: prob,
      explanation: `C(${n},${target})/${total} = ${ways}/${total} = ${prob}`,
    };
  },
  // Dice
  (d) => {
    const faces = [1, 2, 3, 4, 5, 6];
    const props = [
      { q: 'even number', f: (x) => x % 2 === 0 },
      { q: 'number > 4', f: (x) => x > 4 },
      { q: 'number ≤ 3', f: (x) => x <= 3 },
      { q: 'prime number', f: (x) => [2, 3, 5].includes(x) },
    ];
    const prop = props[Math.floor(Math.random() * props.length)];
    const favorable = faces.filter(prop.f).length;
    const prob = simplify(favorable, 6);
    return {
      prompt: `Roll a die. P(${prop.q})?`,
      answer: prob,
      explanation: `${favorable} favorable out of 6 = ${prob}`,
    };
  },
  // Cards
  (d) => {
    const questions = [
      { q: 'a heart', num: 13, den: 52, exp: '13 hearts out of 52' },
      { q: 'an ace', num: 4, den: 52, exp: '4 aces out of 52' },
      { q: 'a face card', num: 12, den: 52, exp: '12 face cards (J,Q,K × 4 suits)' },
      { q: 'a red card', num: 26, den: 52, exp: '26 red cards out of 52' },
    ];
    const c = questions[Math.floor(Math.random() * questions.length)];
    return {
      prompt: `Draw 1 card from 52. P(${c.q})?`,
      answer: simplify(c.num, c.den),
      explanation: c.exp,
    };
  },
];

export function generate(difficulty = 3) {
  const gen = GENERATORS[Math.floor(Math.random() * Math.min(GENERATORS.length, difficulty))];
  const { prompt, answer, explanation } = gen(difficulty);

  // Generate wrong options
  const options = new Set([answer]);
  const fractions = ['1/2', '1/3', '1/4', '1/5', '1/6', '1/8', '1/12', '1/13', '2/3', '3/4', '1/52', '1/26', '3/8', '5/6'];
  while (options.size < 4) {
    const f = fractions[Math.floor(Math.random() * fractions.length)];
    if (f !== answer) options.add(f);
  }

  return {
    prompt,
    options: [...options].sort(() => Math.random() - 0.5),
    answer,
    explanation,
    difficulty,
  };
}

function comb(n, k) {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) result = result * (n - i) / (i + 1);
  return Math.round(result);
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function simplify(num, den) {
  const g = gcd(num, den);
  return `${num / g}/${den / g}`;
}
