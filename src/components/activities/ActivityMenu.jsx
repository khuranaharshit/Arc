import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { CATEGORIES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const MOCK_ACTIVITIES = [
  { key: 'exercise_30min', label: 'Exercise (30+ min, real effort)', category: 'body', xp: 8, once_per_day: true },
  { key: 'walk_20min', label: 'Walk (20+ min, outdoors)', category: 'body', xp: 4, once_per_day: true },
  { key: 'sleep_8hrs', label: '8 hrs sleep (tracked honestly)', category: 'body', xp: 5, once_per_day: true },
  { key: 'no_phone_morning', label: 'No phone first 30 min of day', category: 'body', xp: 3, once_per_day: true },
  { key: 'no_screens_bed', label: 'No screens 30 min before bed', category: 'body', xp: 3, once_per_day: true },
  { key: 'brilliant_lesson', label: 'Brilliant.org lesson', category: 'mind', xp: 6, once_per_day: false },
  { key: 'leetcode_problem', label: '1 LeetCode / Project Euler problem', category: 'mind', xp: 8, once_per_day: false },
  { key: 'chess_puzzles', label: 'Chess puzzle set (15+ min)', category: 'mind', xp: 5, once_per_day: false },
  { key: 'chess_game', label: 'Chess game + analyze afterward', category: 'mind', xp: 8, once_per_day: false },
  { key: 'new_concept', label: 'Learn 1 new concept', category: 'mind', xp: 6, once_per_day: false },
  { key: 'fermi_estimate', label: 'Fermi estimate (guess then check)', category: 'mind', xp: 3, once_per_day: false },
  { key: 'audiobook_30min', label: 'Audiobook (30+ min)', category: 'learning', xp: 5, once_per_day: false },
  { key: 'read_book_20min', label: 'Read physical book (20+ min)', category: 'learning', xp: 6, once_per_day: false },
  { key: 'pg_essay', label: 'Read 1 Paul Graham essay', category: 'learning', xp: 4, once_per_day: false },
  { key: 'podcast', label: 'Podcast (Huberman, Lex, Farnam St)', category: 'learning', xp: 3, once_per_day: false },
  { key: 'finish_book', label: 'Finish a book', category: 'learning', xp: 20, once_per_day: false },
  { key: 'write_publish', label: 'Write & publish something', category: 'communication', xp: 12, once_per_day: false },
  { key: 'journal_3sent', label: 'Journal (3+ sentences)', category: 'communication', xp: 4, once_per_day: true },
  { key: 'decision_journal', label: 'Decision journal entry', category: 'communication', xp: 5, once_per_day: false },
  { key: 'active_listening', label: 'Summarized someone\'s point before responding', category: 'communication', xp: 3, once_per_day: false },
  { key: 'ai_real_problem', label: 'Used AI on a real problem', category: 'technical', xp: 4, once_per_day: false },
  { key: 'ai_error_caught', label: 'Caught an AI error before acting on it', category: 'technical', xp: 6, once_per_day: false },
  { key: 'side_project', label: 'Side project work (30+ min)', category: 'technical', xp: 8, once_per_day: false },
  { key: 'shipped_something', label: 'Shipped something', category: 'technical', xp: 25, once_per_day: false },
  { key: 'family_time', label: 'Fully present family time (1+ hr)', category: 'social', xp: 6, once_per_day: true },
  { key: 'meaningful_conversation', label: 'Meaningful conversation', category: 'social', xp: 5, once_per_day: false },
  { key: 'helped_someone', label: 'Helped someone (nothing expected back)', category: 'social', xp: 5, once_per_day: false },
  { key: 'hard_conversation', label: 'Had a hard conversation you were avoiding', category: 'social', xp: 10, once_per_day: false },
  { key: 'phone_drawer', label: 'Phone in drawer (1+ hr work block)', category: 'discipline', xp: 4, once_per_day: false },
  { key: 'screen_time_low', label: 'Screen time under 3 hrs', category: 'discipline', xp: 5, once_per_day: true },
  { key: 'no_social_media', label: 'No social media today', category: 'discipline', xp: 5, once_per_day: true },
  { key: 'said_no', label: 'Said no to something that didn\'t matter', category: 'discipline', xp: 3, once_per_day: false },
];

const CATEGORY_COLORS = {
  body: '#f43f5e', mind: '#a855f7', learning: '#3b82f6',
  communication: '#f59e0b', technical: '#10b981', social: '#ec4899', discipline: '#6366f1',
};

export function ActivityMenu() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [confirmActivity, setConfirmActivity] = useState(null);
  const [loggedToday, setLoggedToday] = useState(new Set());
  const { addToast } = useToast();
  const categories = Object.values(CATEGORIES);

  const filtered = activeCategory === 'all'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter((a) => a.category === activeCategory);

  const handleLog = () => {
    if (!confirmActivity) return;
    const isCrit = Math.random() < 0.1;
    const xp = isCrit ? confirmActivity.xp * 2 : confirmActivity.xp;
    addToast(
      `${isCrit ? 'CRITICAL HIT! ' : ''}+${xp} XP — ${confirmActivity.label}`,
      'xp',
    );
    setLoggedToday((prev) => new Set([...prev, confirmActivity.key]));
    setConfirmActivity(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Log XP</h1>
        <p className="text-sm text-white/30">Tap an activity to log it.</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat.key
                ? 'text-white shadow-lg'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
            style={activeCategory === cat.key ? { background: CATEGORY_COLORS[cat.key] } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Activity cards */}
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((act) => {
          const done = loggedToday.has(act.key);
          return (
            <button
              key={act.key}
              disabled={done && act.once_per_day}
              className={`flex items-center justify-between rounded-2xl border bg-white/[0.02] p-3.5 text-left transition-all active:scale-[0.98] ${
                done
                  ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60'
                  : 'border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10'
              }`}
              onClick={() => !done && setConfirmActivity(act)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: CATEGORY_COLORS[act.category] }}
                />
                <div>
                  <p className={`text-sm font-medium ${done ? 'text-emerald-400/80 line-through' : 'text-white/70'}`}>
                    {act.label}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {act.once_per_day && <span className="text-[10px] text-white/20">1x/day</span>}
                    {done && <span className="text-[10px] text-emerald-400/60">Logged</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-purple-400">
                <Zap className="h-3.5 w-3.5" />
                {act.xp}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm modal */}
      <Modal
        isOpen={!!confirmActivity}
        onClose={() => setConfirmActivity(null)}
        title="Log Activity"
      >
        {confirmActivity && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-4">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: CATEGORY_COLORS[confirmActivity.category] }}
              />
              <div>
                <p className="text-sm font-semibold text-white/90">{confirmActivity.label}</p>
                <p className="text-xs text-white/30">{CATEGORIES[confirmActivity.category]?.label}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-purple-400">
              <Zap className="h-6 w-6" />
              +{confirmActivity.xp} XP
            </div>
            <p className="text-center text-xs text-white/25">10% chance of critical hit (2x XP)</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmActivity(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={handleLog} className="btn-primary flex-1">
                Log it!
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
