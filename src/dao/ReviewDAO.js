import { BaseDAO } from './BaseDAO.js';
import { getWeekString } from '../utils/dates.js';

export class ReviewDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'reviews');
  }

  getDefaultData() {
    return { version: 1, reviews: [] };
  }

  async submitReview({ scores, win, fix, currentBook, bookProgress, weeklyXP }) {
    const data = await this.getData();
    const review = {
      id: crypto.randomUUID(),
      week: getWeekString(),
      date: new Date().toISOString().split('T')[0],
      scores,
      total_score: Object.values(scores).reduce((s, v) => s + v, 0),
      weekly_xp: weeklyXP || 0,
      win,
      fix,
      current_book: currentBook,
      book_progress: bookProgress,
    };
    data.reviews.push(review);
    await this.saveData(data);
    return review;
  }

  async getReviews() {
    const data = await this.getData();
    return data.reviews;
  }

  async getLatestReview() {
    const data = await this.getData();
    return data.reviews[data.reviews.length - 1] || null;
  }
}
