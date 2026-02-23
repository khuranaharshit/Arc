import { BaseDAO } from './BaseDAO.js';
import { getWeekString } from '../utils/dates.js';

/**
 * Manages level progression and seasons.
 * Seasons reset quarterly — previous level becomes a legacy badge.
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
      season: {
        number: 1,
        start_date: new Date().toISOString().split('T')[0],
        quarter: this._currentQuarter(),
        legacy_badges: [],
      },
    };
  }

  async updateWeeklyXP(weeklyXP, levelsConfig) {
    const data = await this.getData();
    const weekStr = getWeekString();

    // Check for season reset
    const currentQ = this._currentQuarter();
    if (data.season.quarter && data.season.quarter !== currentQ) {
      // New season — archive current level as legacy badge
      data.season.legacy_badges.push({
        season: data.season.number,
        quarter: data.season.quarter,
        level: data.current_level,
        level_name: data.current_level_name,
      });
      data.season.number++;
      data.season.quarter = currentQ;
      data.season.start_date = new Date().toISOString().split('T')[0];
      // Soft reset: drop 1 level (min 1)
      data.current_level = Math.max(1, data.current_level - 1);
      data.current_level_name = levelsConfig.levels.find((l) => l.level === data.current_level)?.name || 'Starting';
      data.consecutive_weeks_at_target = 0;
    }

    // Upsert this week's entry
    const existing = data.weekly_xp_history.find((w) => w.week === weekStr);
    if (existing) existing.xp = weeklyXP;
    else data.weekly_xp_history.push({ week: weekStr, xp: weeklyXP });

    if (data.weekly_xp_history.length > 52) {
      data.weekly_xp_history = data.weekly_xp_history.slice(-52);
    }

    const levels = levelsConfig.levels;
    const nextLevel = levels.find((l) => l.level === data.current_level + 1);

    if (!nextLevel) {
      await this.saveData(data);
      return { leveled_up: false, current_level: data.current_level };
    }

    if (weeklyXP >= nextLevel.weekly_xp) data.consecutive_weeks_at_target++;
    else data.consecutive_weeks_at_target = 0;

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
    return data.weekly_xp_history.find((w) => w.week === weekStr)?.xp || 0;
  }

  async getLegacyBadges() {
    const data = await this.getData();
    return data.season.legacy_badges || [];
  }

  async getSeasonInfo() {
    const data = await this.getData();
    return data.season;
  }

  _currentQuarter() {
    const now = new Date();
    return `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  }
}
