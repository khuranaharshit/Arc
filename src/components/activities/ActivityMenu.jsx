import { useState } from 'react';
import { Plus, Zap, Sparkles } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CATEGORIES } from '../../utils/constants';

// Mock activities from xp-menu config
const MOCK_ACTIVITIES = [
  { key: 'exercise_30min', label: 'Exercise (30+ min, real effort)', category: 'body', xp: 8, once_per_day: true },
  { key: 'walk_20min', label: 'Walk (20+ min, outdoors)', category: 'body', xp: 4, once_per_day: true },
  { key: 'sleep_8hrs', label: '8 hrs sleep (tracked honestly)', category: 'body', xp: 5, once_per_day: true },
  { key: 'no_phone_morning', label: 'No phone first 30 min of day', category: 'body', xp: 3, once_per_day: true },
  { key: 'brilliant_lesson', label: 'Brilliant.org lesson', category: 'mind', xp: 6, once_per_day: false },
  { key: 'leetcode_problem', label: '1 LeetCode / Project Euler problem', category: 'mind', xp: 8, once_per_day: false },
  { key: 'chess_puzzles', label: 'Chess puzzle set (15+ min)', category: 'mind', xp: 5, once_per_day: false },
  { key: 'chess_game', label: 'Chess game + analyze afterward', category: 'mind', xp: 8, once_per_day: false },
  { key: 'new_concept', label: 'Learn 1 new concept (math, logic, CS)', category: 'mind', xp: 6, once_per_day: false },
  { key: 'audiobook_30min', label: 'Audiobook (30+ min)', category: 'learning', xp: 5, once_per_day: false },
  { key: 'read_book_20min', label: 'Read physical book (20+ min)', category: 'learning', xp: 6, once_per_day: false },
  { key: 'pg_essay', label: 'Read 1 Paul Graham essay', category: 'learning', xp: 4, once_per_day: false },
  { key: 'finish_book', label: 'Finish a book', category: 'learning', xp: 20, once_per_day: false },
  { key: 'write_publish', label: 'Write & publish something', category: 'communication', xp: 12, once_per_day: false },
  { key: 'journal_3sent', label: 'Journal (3+ sentences)', category: 'communication', xp: 4, once_per_day: true },
  { key: 'ai_real_problem', label: 'Used AI on a real problem', category: 'technical', xp: 4, once_per_day: false },
  { key: 'side_project', label: 'Side project work (30+ min)', category: 'technical', xp: 8, once_per_day: false },
  { key: 'shipped_something', label: 'Shipped something', category: 'technical', xp: 25, once_per_day: false },
  { key: 'family_time', label: 'Fully present family time (1+ hr)', category: 'social', xp: 6, once_per_day: true },
  { key: 'meaningful_conversation', label: 'Meaningful conversation', category: 'social', xp: 5, once_per_day: false },
  { key: 'phone_drawer', label: 'Phone in drawer (1+ hr work block)', category: 'discipline', xp: 4, once_per_day: false },
  { key: 'no_social_media', label: 'No social media today', category: 'discipline', xp: 5, once_per_day: true },
  { key: 'screen_time_low', label: 'Screen time under 3 hrs', category: 'discipline', xp: 5, once_per_day: true },
];

const CATEGORY_BG = {
  body: 'border-red-500/30 hover:bg-red-500/10',
  mind: 'border-violet-500/30 hover:bg-violet-500/10',
  learning: 'border-blue-500/30 hover:bg-blue-500/10',
  communication: 'border-amber-500/30 hover:bg-amber-500/10',
  technical: 'border-emerald-500/30 hover:bg-emerald-500/10',
  social: 'border-pink-500/30 hover:bg-pink-500/10',
  discipline: 'border-indigo-500/30 hover:bg-indigo-500/10',
};

export function ActivityMenu() {
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = Object.values(CATEGORIES);

  const filtered =
    activeCategory === 'all'
      ? MOCK_ACTIVITIES
      : MOCK_ACTIVITIES.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Log XP</h1>
        <p className="text-sm text-slate-400">Tap an activity to log it.</p>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat.key
                ? 'bg-primary text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Activity cards */}
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((act) => (
          <button
            key={act.key}
            className={`flex items-center justify-between rounded-xl border bg-surface p-3 text-left transition-all active:scale-[0.98] ${CATEGORY_BG[act.category]}`}
            onClick={() => console.log('Log:', act.key)}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORIES[act.category]?.color }}
              />
              <div>
                <p className="text-sm font-medium text-slate-200">{act.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {act.once_per_day && (
                    <span className="text-[10px] text-slate-500">1x/day</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-violet-400">
              <Zap className="h-3.5 w-3.5" />
              {act.xp}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
