import { Trophy, Lock, Zap, Flame, Book, Code, PenTool, Shield, Crown, Calendar, Ghost, EyeOff, Hammer, ShieldAlert } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';

const ICON_MAP = {
  zap: Zap,
  book: Book,
  library: Book,
  flame: Flame,
  diamond: Trophy,
  cpu: Code,
  hammer: Hammer,
  'shield-alert': ShieldAlert,
  'pen-tool': PenTool,
  ghost: Ghost,
  'eye-off': EyeOff,
  crown: Crown,
  calendar: Calendar,
};

// Mock achievements
const ACHIEVEMENTS = [
  { key: 'first_blood', name: 'First Blood', desc: 'Hit 10 XP in a single day', icon: 'zap', unlocked: true, date: 'Feb 1' },
  { key: 'iron_mind', name: 'Iron Mind', desc: '30-day streak', icon: 'flame', unlocked: false, progress: 14, target: 30 },
  { key: 'bookworm_i', name: 'Bookworm I', desc: 'Finish your 1st book', icon: 'book', unlocked: false, progress: 0, target: 1 },
  { key: 'logic_i', name: 'Logic I', desc: 'Solve 10 LeetCode problems', icon: 'cpu', unlocked: false, progress: 7, target: 10 },
  { key: 'builder', name: 'Builder', desc: 'Ship 1 side project', icon: 'hammer', unlocked: false, progress: 0, target: 1 },
  { key: 'writer_i', name: 'Writer I', desc: 'Publish 4 pieces', icon: 'pen-tool', unlocked: false, progress: 2, target: 4 },
  { key: 'ai_skeptic', name: 'AI Skeptic', desc: 'Catch 10 AI errors', icon: 'shield-alert', unlocked: false, progress: 3, target: 10 },
  { key: 'ghost_mode', name: 'Ghost Mode', desc: '7 days screen time under 2 hrs', icon: 'ghost', unlocked: false, progress: 2, target: 7 },
  { key: 'diamond_mind', name: 'Diamond Mind', desc: '90-day streak', icon: 'diamond', unlocked: false, progress: 14, target: 90 },
  { key: 'level_5', name: 'Level 5', desc: 'Sustain 200+ XP/week for 4 weeks', icon: 'crown', unlocked: false, progress: 0, target: 4 },
  { key: 'year_one', name: 'Year One', desc: 'Complete 52 weekly reviews', icon: 'calendar', unlocked: false, progress: 2, target: 52 },
  { key: 'monk_mode', name: 'Monk Mode', desc: '30 days no social media', icon: 'eye-off', unlocked: false, progress: 5, target: 30 },
];

export function AchievementList() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked);
  const locked = ACHIEVEMENTS.filter((a) => !a.unlocked);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Achievements</h1>
        <p className="text-sm text-slate-400">
          {unlocked.length} / {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-emerald-400">Unlocked</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.map((ach) => {
              const Icon = ICON_MAP[ach.icon] || Trophy;
              return (
                <Card key={ach.key} className="border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                      <Icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{ach.name}</h3>
                      <p className="text-xs text-slate-400">{ach.desc}</p>
                      <p className="mt-1 text-[10px] text-emerald-400/60">{ach.date}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-400">In Progress</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locked.map((ach) => {
            const Icon = ICON_MAP[ach.icon] || Lock;
            const pct = Math.round((ach.progress / ach.target) * 100);
            return (
              <Card key={ach.key} className="opacity-80">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50">
                    <Icon className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-300">{ach.name}</h3>
                    <p className="text-xs text-slate-500">{ach.desc}</p>
                    <ProgressBar
                      value={ach.progress}
                      max={ach.target}
                      size="sm"
                      color="bg-slate-500"
                      className="mt-2"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">
                      {ach.progress}/{ach.target} ({pct}%)
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
