import { BaseDAO } from './BaseDAO.js';
import { getToday } from '../utils/dates.js';

export class HabitDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'habits');
  }

  getDefaultData() {
    return { version: 1, habit_definitions: [], log: {} };
  }

  async addHabit(key, label, icon = '✅') {
    const data = await this.getData();
    if (data.habit_definitions.some((h) => h.key === key)) return;
    data.habit_definitions.push({ key, label, icon, created_at: getToday() });
    await this.saveData(data);
  }

  async removeHabit(key) {
    const data = await this.getData();
    data.habit_definitions = data.habit_definitions.filter((h) => h.key !== key);
    await this.saveData(data);
  }

  async toggleHabit(key, date = getToday()) {
    const data = await this.getData();
    if (!data.log[date]) data.log[date] = {};
    data.log[date][key] = !data.log[date][key];
    await this.saveData(data);
    return data.log[date][key];
  }

  async getTodayLog() {
    const data = await this.getData();
    return data.log[getToday()] || {};
  }

  async getHabits() {
    const data = await this.getData();
    return data.habit_definitions;
  }

  async getWeekLog() {
    const data = await this.getData();
    const result = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result[dateStr] = data.log[dateStr] || {};
    }
    return result;
  }
}
