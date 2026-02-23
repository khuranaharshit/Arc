import { BaseDAO } from './BaseDAO.js';

/**
 * Manages achievement unlock detection and progress tracking.
 */
export class AchievementDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'achievements');
  }

  getDefaultData() {
    return { version: 1, unlocked: [], progress: {} };
  }

  /**
   * Check all achievement conditions and unlock any that are met.
   * Call after activity logging, streak updates, etc.
   * Returns array of newly unlocked achievements.
   */
  async checkAll(achievementsConfig, context) {
    const data = await this.getData();
    const newlyUnlocked = [];

    for (const ach of achievementsConfig.achievements) {
      // Skip if already unlocked
      if (data.unlocked.some((u) => u.key === ach.key)) continue;

      const { met, current, target } = await this._evaluateCondition(ach.condition, context);

      // Update progress
      data.progress[ach.key] = { current, target };

      if (met) {
        data.unlocked.push({
          key: ach.key,
          unlocked_at: new Date().toISOString(),
          xp_awarded: 10, // flat 10 XP per achievement
        });
        newlyUnlocked.push(ach);
      }
    }

    await this.saveData(data);
    return newlyUnlocked;
  }

  async _evaluateCondition(condition, ctx) {
    switch (condition.type) {
      case 'daily_xp_gte': {
        const todayXP = await ctx.activityDAO.getTodayXP();
        return { met: todayXP >= condition.value, current: todayXP, target: condition.value };
      }
      case 'activity_count': {
        const count = await ctx.activityDAO.getActivityCount(condition.activity_key);
        return { met: count >= condition.value, current: count, target: condition.value };
      }
      case 'streak_gte': {
        const streak = await ctx.streakDAO.getCurrentStreak();
        return { met: streak >= condition.value, current: streak, target: condition.value };
      }
      case 'level_gte': {
        const levelData = await ctx.levelDAO.getLevelData();
        return { met: levelData.current_level >= condition.value, current: levelData.current_level, target: condition.value };
      }
      case 'review_count': {
        const reviews = await ctx.reviewDAO?.getData();
        const count = reviews?.reviews?.length || 0;
        return { met: count >= condition.value, current: count, target: condition.value };
      }
      case 'consecutive_activity': {
        // Simplified: count total occurrences (proper consecutive tracking added later)
        const count = await ctx.activityDAO.getActivityCount(condition.activity_key);
        return { met: count >= condition.value, current: count, target: condition.value };
      }
      default:
        return { met: false, current: 0, target: 0 };
    }
  }

  async getUnlocked() {
    const data = await this.getData();
    return data.unlocked;
  }

  async getProgress() {
    const data = await this.getData();
    return data.progress;
  }

  async getAchievementData() {
    return this.getData();
  }
}
