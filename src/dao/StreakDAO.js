import { BaseDAO } from './BaseDAO.js';
import { getToday, daysBetween } from '../utils/dates.js';

/**
 * Manages streaks: current, longest, two-day rule, rest days, bonuses.
 */
export class StreakDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'streaks');
  }

  getDefaultData() {
    return {
      version: 1,
      current_streak: 0,
      longest_streak: 0,
      streak_start_date: null,
      last_active_date: null,
      streak_history: [],
      bonuses_earned: [],
      rest_days: [],
    };
  }

  /**
   * Update streak based on today's XP. Call after each activity log.
   * Returns { current_streak, bonus_earned: { days, xp } | null }.
   */
  async updateStreak(todayXP, streakConfig) {
    const data = await this.getData();
    const today = getToday();

    if (todayXP < streakConfig.min_daily_xp) {
      return { current_streak: data.current_streak, bonus_earned: null };
    }

    // Already counted today
    if (data.last_active_date === today) {
      return { current_streak: data.current_streak, bonus_earned: null };
    }

    let bonusEarned = null;

    if (!data.last_active_date) {
      // First ever day
      data.current_streak = 1;
      data.streak_start_date = today;
    } else {
      const gap = daysBetween(data.last_active_date, today);

      if (gap === 1) {
        // Consecutive day
        data.current_streak++;
      } else if (gap === 2 && streakConfig.two_day_rule) {
        // Two-day rule: 1 day gap allowed
        data.current_streak++;
      } else {
        // Streak broken
        if (data.current_streak > 0) {
          data.streak_history.push({
            start: data.streak_start_date,
            end: data.last_active_date,
            length: data.current_streak,
          });
        }
        data.current_streak = 1;
        data.streak_start_date = today;
      }
    }

    data.last_active_date = today;

    // Check streak bonuses
    for (const bonus of streakConfig.bonuses) {
      if (data.current_streak === bonus.days) {
        const alreadyEarned = data.bonuses_earned.some(
          (b) => b.streak === bonus.days && b.date === today,
        );
        if (!alreadyEarned) {
          data.bonuses_earned.push({ streak: bonus.days, xp: bonus.xp, date: today });
          bonusEarned = { days: bonus.days, xp: bonus.xp };
        }
      }
    }

    // Update longest
    if (data.current_streak > data.longest_streak) {
      data.longest_streak = data.current_streak;
    }

    await this.saveData(data);
    return { current_streak: data.current_streak, bonus_earned: bonusEarned };
  }

  async getCurrentStreak() {
    const data = await this.getData();
    return data.current_streak;
  }

  async getLongestStreak() {
    const data = await this.getData();
    return data.longest_streak;
  }

  async isStreakAlive() {
    const data = await this.getData();
    if (!data.last_active_date) return false;
    const gap = daysBetween(data.last_active_date, getToday());
    return gap <= 1; // 0 = today, 1 = yesterday (still alive)
  }

  async markRestDay(date) {
    const data = await this.getData();
    if (!data.rest_days.includes(date)) {
      data.rest_days.push(date);
    }
    await this.saveData(data);
  }

  async getStreakData() {
    return this.getData();
  }
}
