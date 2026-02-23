import { Plus, HeartPulse, Brain, BookOpen, Code, Shield } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useNavigate } from 'react-router-dom';

// Quick actions — most common activities
const QUICK_ACTIONS = [
  { key: 'exercise_30min', label: 'Exercise', icon: HeartPulse, xp: 8, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { key: 'brilliant_lesson', label: 'Brilliant', icon: Brain, xp: 6, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { key: 'read_book_20min', label: 'Read', icon: BookOpen, xp: 6, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { key: 'leetcode_problem', label: 'LeetCode', icon: Code, xp: 8, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { key: 'no_social_media', label: 'No Social', icon: Shield, xp: 5, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
];

export function QuickLog() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader
        title="Quick Log"
        icon={Plus}
        action={
          <button
            onClick={() => navigate('/log')}
            className="text-xs text-primary hover:text-primary-light"
          >
            View all
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all hover:scale-[1.03] active:scale-[0.97] ${action.color}`}
              onClick={() => {
                // TODO: wire to ActivityDAO.logActivity()
                console.log('Log:', action.key);
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
              <span className="text-[10px] opacity-60">+{action.xp} XP</span>
            </button>
          );
        })}
        <button
          onClick={() => navigate('/log')}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-slate-600 p-3 text-slate-500 transition-all hover:border-slate-500 hover:text-slate-400"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </Card>
  );
}
