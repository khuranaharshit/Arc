/**
 * Open Trivia DB client — free trivia questions, no auth needed.
 * https://opentdb.com/api_config.php
 */

const BASE_URL = 'https://opentdb.com/api.php';

/**
 * Fetch trivia questions.
 * @param {number} amount — number of questions (1-50)
 * @param {string} difficulty — 'easy' | 'medium' | 'hard'
 * @returns {Promise<{prompt, options, answer, explanation}[]>}
 */
export async function fetchTrivia(amount = 5, difficulty = 'medium') {
  try {
    const params = new URLSearchParams({
      amount: String(amount),
      difficulty,
      type: 'multiple',
    });

    const resp = await fetch(`${BASE_URL}?${params}`);
    if (!resp.ok) return [];

    const data = await resp.json();
    if (data.response_code !== 0) return [];

    return data.results.map((q) => {
      const options = [...q.incorrect_answers, q.correct_answer]
        .map(decodeHTML)
        .sort(() => Math.random() - 0.5);

      return {
        prompt: decodeHTML(q.question),
        options,
        answer: decodeHTML(q.correct_answer),
        explanation: `Category: ${decodeHTML(q.category)}`,
        difficulty: { easy: 1, medium: 3, hard: 5 }[q.difficulty] || 3,
      };
    });
  } catch (err) {
    console.error('TriviaAPI error:', err);
    return [];
  }
}

function decodeHTML(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}
