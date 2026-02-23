import { BaseDAO } from './BaseDAO.js';
import { getToday } from '../utils/dates.js';

/**
 * Daily quests — 3 random activities from XP menu, 1.5x bonus if all 3 completed.
 * Quests regenerate each day.
 */
export class QuestDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'quests');
  }

  getDefaultData() {
    return { version: 1, days: {} };
  }

  /**
   * Get today's quests. Generates new ones if none exist for today.
   */
  async getTodayQuests(xpMenuConfig) {
    const data = await this.getData();
    const today = getToday();

    if (!data.days[today]) {
      // Generate 3 random quests from different categories
      const activities = xpMenuConfig.activities;
      const selected = this._pickQuests(activities, 3);
      data.days[today] = {
        quests: selected.map((a) => ({
          activity_key: a.key,
          label: a.label,
          category: a.category,
          xp: a.xp,
          completed: false,
        })),
        bonus_claimed: false,
      };
      // Prune old days (keep last 7)
      const keys = Object.keys(data.days).sort();
      if (keys.length > 7) {
        keys.slice(0, keys.length - 7).forEach((k) => delete data.days[k]);
      }
      await this.saveData(data);
    }

    return data.days[today];
  }

  /**
   * Mark a quest as completed. Returns { all_done, bonus_xp }.
   */
  async completeQuest(activityKey) {
    const data = await this.getData();
    const today = getToday();
    const day = data.days[today];
    if (!day) return { all_done: false, bonus_xp: 0 };

    const quest = day.quests.find((q) => q.activity_key === activityKey);
    if (quest) quest.completed = true;

    const allDone = day.quests.every((q) => q.completed);
    let bonusXP = 0;

    if (allDone && !day.bonus_claimed) {
      // 1.5x bonus = sum of all quest XP * 0.5
      bonusXP = Math.round(day.quests.reduce((s, q) => s + q.xp, 0) * 0.5);
      day.bonus_claimed = true;
    }

    await this.saveData(data);
    return { all_done: allDone, bonus_xp: bonusXP };
  }

  _pickQuests(activities, count) {
    // Pick from different categories for variety
    const byCategory = {};
    activities.forEach((a) => {
      if (!byCategory[a.category]) byCategory[a.category] = [];
      byCategory[a.category].push(a);
    });

    const cats = Object.keys(byCategory);
    const shuffled = cats.sort(() => Math.random() - 0.5);
    const result = [];

    for (const cat of shuffled) {
      if (result.length >= count) break;
      const pool = byCategory[cat];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!result.some((r) => r.key === pick.key)) {
        result.push(pick);
      }
    }

    // If not enough from unique categories, fill from any
    while (result.length < count) {
      const pick = activities[Math.floor(Math.random() * activities.length)];
      if (!result.some((r) => r.key === pick.key)) {
        result.push(pick);
      }
    }

    return result;
  }
}
