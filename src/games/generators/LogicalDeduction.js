/**
 * Generates constraint-based logic puzzles.
 * "A > B, C < A, B > D" → "Rank from highest to lowest"
 */

const NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];

export function generate(difficulty = 3) {
  const count = Math.min(3 + Math.floor(difficulty / 2), 5);
  const entities = NAMES.slice(0, count);

  // Generate a random total order
  const order = [...entities].sort(() => Math.random() - 0.5);

  // Generate constraints from the order
  const constraints = [];
  for (let i = 0; i < order.length - 1; i++) {
    constraints.push(`${order[i]} > ${order[i + 1]}`);
  }
  // Add extra constraints for higher difficulty
  if (difficulty >= 3 && order.length >= 4) {
    constraints.push(`${order[0]} > ${order[order.length - 1]}`);
  }
  // Shuffle constraints so order isn't obvious
  constraints.sort(() => Math.random() - 0.5);

  const answer = order.join(', ');

  // Generate wrong options by shuffling
  const wrongOptions = new Set();
  while (wrongOptions.size < 3) {
    const wrong = [...order].sort(() => Math.random() - 0.5).join(', ');
    if (wrong !== answer) wrongOptions.add(wrong);
  }

  const options = [answer, ...wrongOptions].sort(() => Math.random() - 0.5);

  return {
    prompt: `${constraints.join('. ')}. Rank highest to lowest.`,
    options,
    answer,
    explanation: `Order: ${answer}`,
    difficulty,
  };
}
