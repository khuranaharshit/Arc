/**
 * ExportDAO — generates structured exports for LLM analysis.
 */
export class ExportDAO {
  constructor(daos) {
    this.daos = daos;
  }

  async generateMarkdown() {
    const { activityDAO, streakDAO, levelDAO, achievementDAO, reviewDAO, moodDAO, goalDAO, journalDAO } = this.daos;

    const [totalXP, totalActs, streakData, levelData, achData, reviews, moods, goals, journal, xpHistory, catBreakdown] = await Promise.all([
      activityDAO.getTotalXP(),
      activityDAO.getTotalActivities(),
      streakDAO.getStreakData(),
      levelDAO.getLevelData(),
      achievementDAO.getAchievementData(),
      reviewDAO.getReviews(),
      moodDAO.getHistory(90),
      goalDAO.getGoals(),
      journalDAO.getEntries(),
      activityDAO.getXPHistory(30),
      activityDAO.getCategoryBreakdown(30),
    ]);

    let md = `# Arc Data Export\n**Exported:** ${new Date().toLocaleDateString()}\n\n`;
    md += `## Summary\n- Total XP: ${totalXP}\n- Activities: ${totalActs}\n- Streak: ${streakData.current_streak}d (best: ${streakData.longest_streak}d)\n`;
    md += `- Level: ${levelData.current_level} (${levelData.current_level_name})\n- Achievements: ${achData.unlocked.length} unlocked\n\n`;

    md += `## XP History (30 days)\n`;
    xpHistory.forEach((d) => { md += `- ${d.date}: ${Math.round(d.xp)} XP\n`; });

    md += `\n## Category Breakdown\n`;
    Object.entries(catBreakdown).forEach(([cat, xp]) => { md += `- ${cat}: ${Math.round(xp)} XP\n`; });

    if (reviews.length > 0) {
      md += `\n## Reviews\n`;
      reviews.slice(-4).forEach((r) => {
        md += `### ${r.week} (${r.total_score}/25)\n`;
        if (r.win) md += `- Win: ${r.win}\n`;
        if (r.fix) md += `- Fix: ${r.fix}\n`;
      });
    }

    if (goals.length > 0) {
      md += `\n## Goals\n`;
      goals.forEach((g) => { md += `- [${g.status === 'completed' ? 'x' : ' '}] ${g.title}\n`; });
    }

    if (moods.length > 0) {
      md += `\n## Mood (recent)\n`;
      moods.slice(-14).forEach((m) => { md += `- ${m.date}: mood=${m.mood}, energy=${m.energy}${m.note ? ` — ${m.note}` : ''}\n`; });
    }

    if (journal.length > 0) {
      md += `\n## Journal (recent)\n`;
      journal.slice(-5).forEach((e) => { md += `### ${e.date}\n${e.text}\n\n`; });
    }

    md += `\n---\n*Analyze this data and provide actionable insights about growth patterns, blind spots, and recommendations.*\n`;
    return md;
  }

  async generateJSON() {
    const { activityDAO, streakDAO, levelDAO, achievementDAO, reviewDAO, habitDAO, moodDAO, goalDAO, journalDAO } = this.daos;

    const [activities, streaks, level, achievements, reviews, habits, moods, goals, journal] = await Promise.all([
      activityDAO.getData(), streakDAO.getStreakData(), levelDAO.getLevelData(),
      achievementDAO.getAchievementData(), reviewDAO.getReviews(), habitDAO.getData(),
      moodDAO.getHistory(90), goalDAO.getGoals(), journalDAO.getEntries(),
    ]);

    return {
      exported_at: new Date().toISOString(),
      daily_log: activities, streaks, level, achievements, reviews, habits, moods, goals, journal,
    };
  }
}
