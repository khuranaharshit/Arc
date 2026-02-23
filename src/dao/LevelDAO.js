import { BaseDAO } from './BaseDAO.js';
import { getWeekString } from '../utils/dates.js';

/**
 * Manages level progression based on weekly XP targets.
 */
export class LevelDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'level');
  }

  getDefaultData() {
    return {
      version: 1,
      current_level: 1,
      current_level_name: 'Starting',
      weekly_xp_history: [],
      consecutive_weeks_at_target: 0,
      level_up_history: [],
      season: { number: 1, start_date: new Date().toISOString().split('T')[0], legacy_badges: [] },
    };
  }

  /**
   * Record this week's XP and check for level-up.
   * Call at end of week or when checking level status.
   */
  async updateWeeklyXP(weeklyXP, levelsConfig) {
    const data = await this.getData();
    const weekStr = getWeekString();

    // Upsert this week's entry
    const existing = data.weekly_xp_history.find((w) => w.week === weekStr);
    if (existing) {
      existing.xp = weeklyXP;
    } else {
      data.weekly_xp_history.push({ week: weekStr, xp: weeklyXP });
    }

    // Keep last 52 weeks only
    if (data.weekly_xp_history.length > 52) {
      data.weekly_xp_history = data.weekly_xp_history.slice(-52);
    }

    // Find current level config and next level
    const levels = levelsConfig.levels;
    const currentLevelConfig = levels.find((l) => l.level === data.current_level);
    const nextLevel = levels.find((l) => l.level === data.current_level + 1);

    if (!nextLevel) {
      // Already max level
      await this.saveData(data);
      return { leveled_up: false, current_level: data.current_level };
    }

    // Check if this week meets the next level's target
    if (weeklyXP >= nextLevel.weekly_xp) {
      data.consecutive_weeks_at_target++;
    } else {
      data.consecutive_weeks_at_target = 0;
    }

    // Level up if enough consecutive weeks
    let leveledUp = false;
    if (data.consecutive_weeks_at_target >= nextLevel.consecutive_weeks) {
      data.current_level = nextLevel.level;
      data.current_level_name = nextLevel.name;
      data.consecutive_weeks_at_target = 0;
      data.level_up_history.push({ level: nextLevel.level, achieved_at: new Date().toISOString() });
      leveledUp = true;
    }

    await this.saveData(data);
    return { leveled_up: leveledUp, current_level: data.current_level };
  }

  async getLevelData() {
    return this.getData();
  }

  async getCurrentWeekXP() {
    const data = await this.getData();
    const weekStr = getWeekString();
    const entry = data.weekly_xp_history.find((w) => w.week === weekStr);
    return entry?.xp || 0;
  }
}
