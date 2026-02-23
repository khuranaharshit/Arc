/**
 * Loads and serves Fermi estimates from config.
 * Randomizes and tracks which ones have been seen.
 */
import { ConfigLoader } from '../../dao/ConfigLoader';

let _estimates = null;
let _seen = new Set();

async function loadEstimates() {
  if (!_estimates) {
    const cfg = await ConfigLoader.fermiEstimates();
    _estimates = cfg.estimates;
  }
  return _estimates;
}

export async function generate(difficulty = null) {
  const estimates = await loadEstimates();
  const pool = difficulty
    ? estimates.filter((e) => e.difficulty === difficulty)
    : estimates;

  // Pick unseen if possible
  const unseen = pool.filter((e) => !_seen.has(e.key));
  const pick = unseen.length > 0
    ? unseen[Math.floor(Math.random() * unseen.length)]
    : pool[Math.floor(Math.random() * pool.length)];

  _seen.add(pick.key);
  if (_seen.size >= estimates.length) _seen.clear();

  // Generate wrong options near the answer
  const answer = pick.answer;
  const options = [answer];
  const prefixes = ['~', '~', '~', '~'];
  // Create order-of-magnitude wrong answers
  if (answer.includes('×')) {
    // Scientific notation — keep as is, add variants
    options.push(answer.replace(/\d+(\.\d+)?/, (m) => String(Number(m) * 10)));
    options.push(answer.replace(/\d+(\.\d+)?/, (m) => String(Number(m) / 10)));
    options.push(answer.replace(/\d+(\.\d+)?/, (m) => String(Number(m) * 100)));
  } else {
    options.push('~' + String(Number(answer.replace(/[^0-9]/g, '')) * 10).toLocaleString());
    options.push('~' + String(Math.round(Number(answer.replace(/[^0-9]/g, '')) / 10)).toLocaleString());
    options.push('~' + String(Number(answer.replace(/[^0-9]/g, '')) * 5).toLocaleString());
  }

  return {
    prompt: pick.question,
    options: options.slice(0, 4).sort(() => Math.random() - 0.5),
    answer: pick.answer,
    explanation: pick.justification,
    difficulty: pick.difficulty,
  };
}
