import { BaseDAO } from './BaseDAO.js';
import { getToday, getWeekString } from '../utils/dates.js';

/**
 * Manages weekly challenges and boss battles.
 * Weekly challenge: auto-generated each week, bonus XP on completion.
 * Boss battle: monthly hard challenge, unique achievement.
 */
export class ChallengeDAO extends BaseDAO {
  constructor(localCache, syncEngine) {
    super(localCache, syncEngine, 'challenges');
  }

  getDefaultData() {
    return { version: 1, weekly: {}, bosses: [] };
  }

  /**
   * Get or generate this week's challenge.
   */
  async getWeeklyChallenge(xpMenuConfig) {
    const data = await this.getData();
    const week = getWeekString();

    if (!data.weekly[week]) {
      data.weekly[week] = this._generateWeekly(xpMenuConfig);
      // Prune old weeks (keep 8)
      const keys = Object.keys(data.weekly).sort();
      if (keys.length > 8) keys.slice(0, keys.length - 8).forEach((k) => delete data.weekly[k]);
      await this.saveData(data);
    }

    return { week, ...data.weekly[week] };
  }

  /**
   * Update weekly challenge progress.
   */
  async updateWeeklyProgress(activityKey, xpMenuConfig) {
    const data = await this.getData();
    const week = getWeekString();
    if (!data.weekly[week]) return null;

    const challenge = data.weekly[week];
    if (challenge.completed) return null;

    // Check if this activity contributes
    const task = challenge.tasks.find((t) => t.activity_key === activityKey && !t.done);
    if (task) {
      task.done = true;
      task.completed_date = getToday();
    }

    // Check if all tasks done
    if (challenge.tasks.every((t) => t.done)) {
      challenge.completed = true;
      challenge.completed_date = getToday();
      challenge.xp_earned = challenge.bonus_xp;
      await this.saveData(data);
      return { completed: true, bonus_xp: challenge.bonus_xp, name: challenge.name };
    }

    await this.saveData(data);
    return null;
  }

  /**
   * Get or generate this month's boss battle.
   */
  async getBossBattle() {
    const data = await this.getData();
    const month = getToday().slice(0, 7); // YYYY-MM
    let boss = data.bosses.find((b) => b.month === month);

    if (!boss) {
      boss = this._generateBoss(month);
      data.bosses.push(boss);
      if (data.bosses.length > 6) data.bosses = data.bosses.slice(-6);
      await this.saveData(data);
    }

    return boss;
  }

  /**
   * Update boss battle progress.
   */
  async updateBossProgress(metric, value) {
    const data = await this.getData();
    const month = getToday().slice(0, 7);
    const boss = data.bosses.find((b) => b.month === month);
    if (!boss || boss.defeated) return null;

    if (boss.metric === metric) {
      boss.current = Math.min(boss.target, (boss.current || 0) + value);
      if (boss.current >= boss.target) {
        boss.defeated = true;
        boss.defeated_date = getToday();
        await this.saveData(data);
        return { defeated: true, name: boss.name, xp: boss.xp_reward };
      }
    }

    await this.saveData(data);
    return null;
  }

  _generateWeekly(config) {
    const templates = [
      { name: 'Body Week', cat: 'body', count: 5, bonus: 25 },
      { name: 'Brain Blast', cat: 'mind', count: 4, bonus: 30 },
      { name: 'Learning Sprint', cat: 'learning', count: 4, bonus: 20 },
      { name: 'Social Butterfly', cat: 'social', count: 3, bonus: 25 },
      { name: 'Focus Master', cat: 'discipline', count: 4, bonus: 25 },
      { name: 'Builder Mode', cat: 'technical', count: 3, bonus: 30 },
      { name: 'Well-Rounded', cat: null, count: 5, bonus: 35 },
    ];

    const tmpl = templates[Math.floor(Math.random() * templates.length)];
    const pool = tmpl.cat
      ? config.activities.filter((a) => a.category === tmpl.cat)
      : config.activities;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(tmpl.count, shuffled.length));

    return {
      name: tmpl.name,
      description: tmpl.cat ? `Complete ${tmpl.count} ${tmpl.cat} activities this week` : `Complete ${tmpl.count} activities from any category`,
      tasks: picked.map((a) => ({ activity_key: a.key, label: a.label, done: false, completed_date: null })),
      bonus_xp: tmpl.bonus,
      completed: false,
      completed_date: null,
      xp_earned: 0,
    };
  }

  _generateBoss(month) {
    const bosses = [
      { name: 'The Iron Giant', description: 'Earn 500 XP this month', metric: 'monthly_xp', target: 500, xp_reward: 75 },
      { name: 'The Streak Keeper', description: 'Maintain a 20-day streak', metric: 'streak', target: 20, xp_reward: 60 },
      { name: 'The Scholar', description: 'Log 30 learning activities', metric: 'learning_count', target: 30, xp_reward: 50 },
      { name: 'The Polymath', description: 'Log activities in all 7 categories', metric: 'unique_categories', target: 7, xp_reward: 80 },
      { name: 'The Centurion', description: 'Log 100 activities this month', metric: 'activity_count', target: 100, xp_reward: 100 },
    ];

    const boss = bosses[Math.floor(Math.random() * bosses.length)];
    return {
      month,
      ...boss,
      current: 0,
      defeated: false,
      defeated_date: null,
    };
  }
}
