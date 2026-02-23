import { BaseDAO } from './BaseDAO.js';

export class FinanceDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'finance');
  }

  getDefaultData() {
    return { version: 1, snapshots: [] };
  }

  async addSnapshot({ month, savingsGoal, savingsCurrent, financialAction, futureGoals, notes }) {
    const data = await this.getData();
    // Replace existing month if present
    data.snapshots = data.snapshots.filter((s) => s.month !== month);
    data.snapshots.push({
      month,
      savings_goal: savingsGoal || 0,
      savings_current: savingsCurrent || 0,
      financial_action: financialAction || '',
      future_goals: futureGoals || [],
      notes: notes || '',
    });
    data.snapshots.sort((a, b) => a.month.localeCompare(b.month));
    await this.saveData(data);
  }

  async getSnapshots() {
    const data = await this.getData();
    return data.snapshots;
  }

  async getLatest() {
    const data = await this.getData();
    return data.snapshots[data.snapshots.length - 1] || null;
  }
}
