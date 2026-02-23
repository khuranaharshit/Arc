import { BaseDAO } from './BaseDAO.js';
import { getToday } from '../utils/dates.js';

export class MoodDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'mood');
  }

  getDefaultData() {
    return { version: 1, entries: [] };
  }

  async logMood(mood, energy, note = '') {
    const data = await this.getData();
    const today = getToday();
    // Replace today's entry if exists
    data.entries = data.entries.filter((e) => e.date !== today);
    data.entries.push({
      date: today,
      mood,
      energy,
      note,
      timestamp: new Date().toISOString(),
    });
    await this.saveData(data);
  }

  async getTodayMood() {
    const data = await this.getData();
    return data.entries.find((e) => e.date === getToday()) || null;
  }

  async getHistory(days = 30) {
    const data = await this.getData();
    return data.entries.slice(-days);
  }
}
