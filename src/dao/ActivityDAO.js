import { BaseDAO } from './BaseDAO.js';
import { getToday } from '../utils/dates.js';

/**
 * Manages daily activity logging, XP calculation, combos, critical hits.
 */
export class ActivityDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'daily-log');
  }

  getDefaultData() {
    return { version: 1, days: {} };
  }

  _ensureDay(data, date) {
    if (!data.days[date]) {
      data.days[date] = {
        activities: [],
        xp_total: 0,
        xp_breakdown: {},
        sleep_hours: 0,
        sleep_multiplier_active: false,
        combo_bonus: 0,
        combo_categories: [],
        games_played: [],
      };
    }
    return data.days[date];
  }

  /**
   * Log an activity. Returns { xp_earned, critical_hit, combo_triggered }.
   */
  async logActivity(activityKey, xpMenuConfig, notes = '') {
    const data = await this.getData();
    const today = getToday();
    const day = this._ensureDay(data, today);
    const activity = xpMenuConfig.activities.find((a) => a.key === activityKey);
    if (!activity) throw new Error(`Unknown activity: ${activityKey}`);

    // Check once_per_day
    if (activity.once_per_day && day.activities.some((a) => a.activity_key === activityKey)) {
      throw new Error(`Activity ${activityKey} already logged today`);
    }

    // Calculate XP
    let baseXP = activity.xp;
    const multipliers = [];
    let criticalHit = false;

    // Sleep multiplier
    if (day.sleep_multiplier_active && !activity.triggers_sleep_multiplier) {
      baseXP *= xpMenuConfig.sleep_multiplier;
      multipliers.push('sleep_bonus');
    }

    // Critical hit
    if (Math.random() < xpMenuConfig.critical_hit_chance) {
      baseXP *= xpMenuConfig.critical_hit_multiplier;
      criticalHit = true;
      multipliers.push('critical_hit');
    }

    const xpEarned = Math.round(baseXP * 10) / 10;

    // If this triggers sleep multiplier, activate it
    if (activity.triggers_sleep_multiplier) {
      day.sleep_multiplier_active = true;
      day.sleep_hours = xpMenuConfig.sleep_threshold_hours;
    }

    // Add activity entry
    day.activities.push({
      id: crypto.randomUUID(),
      activity_key: activityKey,
      category: activity.category,
      xp_base: activity.xp,
      xp_earned: xpEarned,
      multipliers,
      critical_hit: criticalHit,
      timestamp: new Date().toISOString(),
      notes,
    });

    // Recalculate totals
    day.xp_total = day.activities.reduce((sum, a) => sum + a.xp_earned, 0);

    // Category breakdown
    day.xp_breakdown = {};
    day.activities.forEach((a) => {
      day.xp_breakdown[a.category] = (day.xp_breakdown[a.category] || 0) + a.xp_earned;
    });

    // Check combo
    let comboTriggered = false;
    const uniqueCategories = [...new Set(day.activities.map((a) => a.category))];
    if (uniqueCategories.length >= xpMenuConfig.combo_threshold_categories && day.combo_bonus === 0) {
      day.combo_bonus = xpMenuConfig.combo_bonus_xp;
      day.combo_categories = uniqueCategories;
      day.xp_total += xpMenuConfig.combo_bonus_xp;
      comboTriggered = true;
    }

    await this.saveData(data);
    return { xp_earned: xpEarned, critical_hit: criticalHit, combo_triggered: comboTriggered };
  }

  async getTodayXP() {
    const data = await this.getData();
    const today = getToday();
    return data.days[today]?.xp_total || 0;
  }

  async getTodayActivities() {
    const data = await this.getData();
    const today = getToday();
    return data.days[today]?.activities || [];
  }

  async getTodayBreakdown() {
    const data = await this.getData();
    const today = getToday();
    return data.days[today]?.xp_breakdown || {};
  }

  async getXPHistory(days = 14) {
    const data = await this.getData();
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({ date: dateStr, xp: data.days[dateStr]?.xp_total || 0 });
    }
    return result;
  }

  async getCategoryBreakdown(days = 30) {
    const data = await this.getData();
    const totals = {};
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const bd = data.days[dateStr]?.xp_breakdown || {};
      Object.entries(bd).forEach(([cat, xp]) => {
        totals[cat] = (totals[cat] || 0) + xp;
      });
    }
    return totals;
  }

  async getActivityCount(activityKey) {
    const data = await this.getData();
    let count = 0;
    Object.values(data.days).forEach((day) => {
      count += day.activities.filter((a) => a.activity_key === activityKey).length;
    });
    return count;
  }

  async getTotalXP() {
    const data = await this.getData();
    return Object.values(data.days).reduce((sum, day) => sum + (day.xp_total || 0), 0);
  }

  async getTotalActivities() {
    const data = await this.getData();
    return Object.values(data.days).reduce((sum, day) => sum + (day.activities?.length || 0), 0);
  }

  async logGame(gameResult) {
    const data = await this.getData();
    const today = getToday();
    const day = this._ensureDay(data, today);
    day.games_played.push(gameResult);
    day.xp_total += gameResult.xp_earned;
    await this.saveData(data);
  }
}
