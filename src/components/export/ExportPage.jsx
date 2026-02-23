import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export function ExportPage() {
  const { activityDAO, streakDAO, levelDAO, achievementDAO, reviewDAO, habitDAO, moodDAO, goalDAO, journalDAO, config } = useData();
  const { addToast } = useToast();
  const [exportData, setExportData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState('markdown');

  const generateExport = async () => {
    const [activities, streaks, level, achievements, reviews, habits, moods, goals, journal] = await Promise.all([
      activityDAO.getData(),
      streakDAO.getStreakData(),
      levelDAO.getLevelData(),
      achievementDAO.getAchievementData(),
      reviewDAO.getReviews(),
      habitDAO.getData(),
      moodDAO.getHistory(90),
      goalDAO.getGoals(),
      journalDAO.getEntries(),
    ]);

    const xpHistory = await activityDAO.getXPHistory(30);
    const catBreakdown = await activityDAO.getCategoryBreakdown(30);
    const totalXP = await activityDAO.getTotalXP();
    const totalActs = await activityDAO.getTotalActivities();

    if (format === 'json') {
      setExportData(JSON.stringify({
        exported_at: new Date().toISOString(),
        summary: { total_xp: totalXP, total_activities: totalActs, current_streak: streaks.current_streak, level: level.current_level, level_name: level.current_level_name, achievements_unlocked: achievements.unlocked.length },
        daily_log: activities,
        streaks, level, achievements, reviews, habits, moods, goals, journal,
        xp_history_30d: xpHistory,
        category_breakdown_30d: catBreakdown,
      }, null, 2));
    } else {
      // Markdown for LLM analysis
      let md = `# Arc Data Export\n`;
      md += `**Exported:** ${new Date().toLocaleDateString()}\n\n`;
      md += `## Summary\n`;
      md += `- **Total XP:** ${totalXP}\n`;
      md += `- **Total Activities:** ${totalActs}\n`;
      md += `- **Current Streak:** ${streaks.current_streak} days\n`;
      md += `- **Longest Streak:** ${streaks.longest_streak} days\n`;
      md += `- **Level:** ${level.current_level} (${level.current_level_name})\n`;
      md += `- **Achievements:** ${achievements.unlocked.length} unlocked\n\n`;

      md += `## Last 30 Days XP\n`;
      xpHistory.forEach((d) => { md += `- ${d.date}: ${Math.round(d.xp)} XP\n`; });

      md += `\n## Category Breakdown (30 days)\n`;
      Object.entries(catBreakdown).forEach(([cat, xp]) => { md += `- ${cat}: ${Math.round(xp)} XP\n`; });

      if (reviews.length > 0) {
        md += `\n## Recent Reviews\n`;
        reviews.slice(-4).forEach((r) => {
          md += `### ${r.week} (${r.total_score}/25, ${r.weekly_xp} XP)\n`;
          if (r.win) md += `- **Win:** ${r.win}\n`;
          if (r.fix) md += `- **Fix:** ${r.fix}\n`;
        });
      }

      if (goals.length > 0) {
        md += `\n## Goals\n`;
        goals.forEach((g) => {
          const done = g.milestones.filter((m) => m.completed).length;
          md += `- [${g.status === 'completed' ? 'x' : ' '}] ${g.title} (${done}/${g.milestones.length} milestones)\n`;
        });
      }

      if (moods.length > 0) {
        md += `\n## Mood Trend (last entries)\n`;
        moods.slice(-14).forEach((m) => {
          md += `- ${m.date}: mood=${m.mood}/5, energy=${m.energy}/5${m.note ? ` — ${m.note}` : ''}\n`;
        });
      }

      if (journal.length > 0) {
        md += `\n## Recent Journal Entries\n`;
        journal.slice(-5).forEach((e) => {
          md += `### ${e.date}\n${e.text}\n${e.tags.length > 0 ? `Tags: ${e.tags.join(', ')}\n` : ''}\n`;
        });
      }

      md += `\n---\n*Analyze this data and give me actionable insights about my growth patterns, blind spots, and recommendations.*\n`;
      setExportData(md);
    }
    addToast('Export generated!', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportData);
    setCopied(true);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'json' ? 'json' : 'md';
    const type = format === 'json' ? 'application/json' : 'text/markdown';
    const blob = new Blob([exportData], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arc-export-${new Date().toISOString().split('T')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Export</h1>
        <p className="text-sm t-muted">Export your data for LLM analysis or backup.</p>
      </div>

      <Card>
        <CardHeader title="Generate Export" icon={Download} />
        <p className="text-xs t-muted mb-4">
          Export your Arc data as Markdown (for pasting into ChatGPT/Claude) or JSON (for programmatic use).
        </p>

        <div className="flex gap-2 mb-4">
          {['markdown', 'json'].map((f) => (
            <button key={f} onClick={() => setFormat(f)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                format === f ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 't-muted'
              }`}
              style={format !== f ? { background: 'var(--color-surface-row)' } : {}}>
              {f === 'markdown' ? 'Markdown (LLM)' : 'JSON (Data)'}
            </button>
          ))}
        </div>

        <button onClick={generateExport} className="btn-primary w-full">
          <Download className="h-4 w-4" /> Generate Export
        </button>
      </Card>

      {exportData && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold t-primary">Preview</h3>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="btn-ghost text-xs">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleDownload} className="btn-ghost text-xs">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </div>
          <pre className="max-h-96 overflow-auto rounded-xl p-4 text-xs font-mono t-tertiary whitespace-pre-wrap"
            style={{ background: 'var(--color-surface-row)' }}>
            {exportData.slice(0, 3000)}{exportData.length > 3000 ? '\n\n... (truncated in preview)' : ''}
          </pre>
        </Card>
      )}
    </div>
  );
}
