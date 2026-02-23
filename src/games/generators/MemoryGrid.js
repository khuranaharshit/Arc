/**
 * Generates memory grid challenges.
 * Flash time decreases with difficulty, grid size increases.
 */

export function generate(difficulty = 3) {
  const sizes = { 1: 3, 2: 3, 3: 4, 4: 4, 5: 5 };
  const flashTimes = { 1: 5000, 2: 4000, 3: 3000, 4: 2500, 5: 2000 };
  const cellCounts = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 };

  const size = sizes[difficulty] || 4;
  const totalCells = size * size;
  const highlightCount = cellCounts[difficulty] || 5;
  const flashTime = flashTimes[difficulty] || 3000;

  // Pick random cells to highlight
  const allPositions = Array.from({ length: totalCells }, (_, i) => i);
  const shuffled = allPositions.sort(() => Math.random() - 0.5);
  const highlighted = shuffled.slice(0, highlightCount).sort((a, b) => a - b);

  return {
    type: 'memory_grid',
    gridSize: size,
    highlighted,
    flashTime,
    difficulty,
    // For the question-based GameSession fallback:
    prompt: `Remember the ${highlightCount} highlighted cells in a ${size}×${size} grid`,
    options: [], // Memory grid uses its own UI
    answer: highlighted.join(','),
    explanation: `Positions: ${highlighted.map((p) => p + 1).join(', ')}`,
  };
}
