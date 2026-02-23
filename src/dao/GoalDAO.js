import { BaseDAO } from './BaseDAO.js';

export class GoalDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'goals');
  }

  getDefaultData() {
    return { version: 1, goals: [] };
  }

  async addGoal(title, quarter) {
    const data = await this.getData();
    const goal = {
      id: crypto.randomUUID(),
      title,
      quarter: quarter || this._currentQuarter(),
      status: 'in_progress',
      milestones: [],
      created_at: new Date().toISOString().split('T')[0],
      completed_at: null,
    };
    data.goals.push(goal);
    await this.saveData(data);
    return goal;
  }

  async addMilestone(goalId, title) {
    const data = await this.getData();
    const goal = data.goals.find((g) => g.id === goalId);
    if (!goal) return;
    goal.milestones.push({ title, completed: false, xp_awarded: 0 });
    await this.saveData(data);
  }

  async toggleMilestone(goalId, milestoneIdx) {
    const data = await this.getData();
    const goal = data.goals.find((g) => g.id === goalId);
    if (!goal || !goal.milestones[milestoneIdx]) return false;
    const m = goal.milestones[milestoneIdx];
    m.completed = !m.completed;
    if (m.completed) m.xp_awarded = 15;
    else m.xp_awarded = 0;
    // Check if all milestones done
    if (goal.milestones.every((ms) => ms.completed)) {
      goal.status = 'completed';
      goal.completed_at = new Date().toISOString().split('T')[0];
    } else {
      goal.status = 'in_progress';
      goal.completed_at = null;
    }
    await this.saveData(data);
    return m.completed;
  }

  async deleteGoal(goalId) {
    const data = await this.getData();
    data.goals = data.goals.filter((g) => g.id !== goalId);
    await this.saveData(data);
  }

  async getGoals() {
    const data = await this.getData();
    return data.goals;
  }

  _currentQuarter() {
    const now = new Date();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    return `${now.getFullYear()}-Q${q}`;
  }
}
