import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { useData } from '../../context/DataContext';

const CATEGORY_META = {
  body: { label: 'Body & Sleep', icon: '💪', color: '#f43f5e', gradient: 'from-rose-500 to-pink-500' },
  mind: { label: 'Brain Sharpening', icon: '🧠', color: '#a855f7', gradient: 'from-purple-500 to-violet-500' },
  learning: { label: 'Learning', icon: '📚', color: '#3b82f6', gradient: 'from-blue-500 to-indigo-500' },
  communication: { label: 'Communication', icon: '💬', color: '#f59e0b', gradient: 'from-amber-500 to-orange-500' },
  technical: { label: 'Technical & AI', icon: '⚡', color: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
  social: { label: 'Relationships', icon: '❤️', color: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
  discipline: { label: 'Discipline', icon: '🛡️', color: '#6366f1', gradient: 'from-indigo-500 to-purple-500' },
};

// Skill levels per category based on total XP
const SKILL_LEVELS = [
  { name: 'Novice', minXP: 0 },
  { name: 'Apprentice', minXP: 50 },
  { name: 'Journeyman', minXP: 150 },
  { name: 'Expert', minXP: 400 },
  { name: 'Master', minXP: 1000 },
  { name: 'Legend', minXP: 2500 },
];

function getSkillLevel(xp) {
  let level = SKILL_LEVELS[0];
  for (const l of SKILL_LEVELS) {
    if (xp >= l.minXP) level = l;
    else break;
  }
  return level;
}

function getNextLevel(xp) {
  for (const l of SKILL_LEVELS) {
    if (xp < l.minXP) return l;
  }
  return null;
}

export function SkillTree() {
  const { activityDAO } = useData();
  const [categoryXP, setCategoryXP] = useState({});

  useEffect(() => {
    // Get all-time category breakdown
    activityDAO.getCategoryBreakdown(365).then(setCategoryXP);
  }, [activityDAO]);

  const categories = Object.entries(CATEGORY_META);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold t-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" /> Skill Tree
        </h2>
        <p className="text-xs t-muted">Your growth across all categories</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map(([key, meta]) => {
          const xp = Math.round(categoryXP[key] || 0);
          const level = getSkillLevel(xp);
          const next = getNextLevel(xp);
          const levelIdx = SKILL_LEVELS.indexOf(level);

          return (
            <Card key={key} className="relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full blur-2xl" style={{ background: meta.color, opacity: 0.1 }} />
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} shadow-lg`}>
                  <span className="text-lg">{meta.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold t-primary">{meta.label}</h3>
                  <p className="text-xs" style={{ color: meta.color }}>{level.name}</p>
                </div>
                <span className="text-lg font-extrabold t-primary">{xp}</span>
                <span className="text-xs t-muted">XP</span>
              </div>

              {/* Level dots */}
              <div className="flex gap-1 mb-2">
                {SKILL_LEVELS.map((l, i) => (
                  <div key={l.name}
                    className={`h-1.5 flex-1 rounded-full transition-all ${i <= levelIdx ? '' : ''}`}
                    style={{ background: i <= levelIdx ? meta.color : 'var(--color-surface-row)', opacity: i <= levelIdx ? 0.6 + (i / SKILL_LEVELS.length) * 0.4 : 1 }}
                  />
                ))}
              </div>

              {next ? (
                <ProgressBar value={xp - level.minXP} max={next.minXP - level.minXP}
                  color={`bg-gradient-to-r ${meta.gradient}`} size="sm"
                  showLabel label={`${next.minXP - xp} XP to ${next.name}`} />
              ) : (
                <p className="text-xs text-center font-medium" style={{ color: meta.color }}>MAX LEVEL</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
