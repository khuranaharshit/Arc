import { BaseDAO } from './BaseDAO.js';

export class JournalDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'journal');
  }

  getDefaultData() {
    return { version: 1, entries: [] };
  }

  async addEntry(text, tags = []) {
    const data = await this.getData();
    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      text,
      tags,
      timestamp: new Date().toISOString(),
    };
    data.entries.push(entry);
    await this.saveData(data);
    return entry;
  }

  async deleteEntry(id) {
    const data = await this.getData();
    data.entries = data.entries.filter((e) => e.id !== id);
    await this.saveData(data);
  }

  async getEntries() {
    const data = await this.getData();
    return data.entries;
  }

  async search(query) {
    const data = await this.getData();
    const q = query.toLowerCase();
    return data.entries.filter(
      (e) => e.text.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
}
