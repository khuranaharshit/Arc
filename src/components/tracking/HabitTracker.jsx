import { CheckSquare, Plus } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';

const MOCK_HABITS = [
  { key: 'drink_water', label: 'Drink 2L water', icon: '💧', checked: true },
  { key: 'meditate', label: 'Meditate 10 min', icon: '🧘', checked: false },
  { key: 'vitamins', label: 'Take vitamins', icon: '💊', checked: true },
  { key: 'no_snooze', label: 'No snooze alarm', icon: '⏰', checked: true },
  { key: 'stretch', label: 'Morning stretch', icon: '🙆', checked: false },
];

export function HabitTracker() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Habits</h1>
          <p className="text-sm text-slate-400">Daily check-ins — {MOCK_HABITS.filter(h => h.checked).length}/{MOCK_HABITS.length} done today.</p>
        </div>
        <button className="btn-ghost">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="space-y-2">
        {MOCK_HABITS.map((habit) => (
          <Card key={habit.key} hover>
            <div className="flex items-center gap-3">
              <button
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                  habit.checked
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-slate-600 bg-slate-800 text-slate-500 hover:border-slate-500'
                }`}
              >
                {habit.checked ? <CheckSquare className="h-4 w-4" /> : null}
              </button>
              <span className="text-lg">{habit.icon}</span>
              <span
                className={`text-sm font-medium ${
                  habit.checked ? 'text-slate-400 line-through' : 'text-slate-200'
                }`}
              >
                {habit.label}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* 7 day mini calendar */}
      <Card>
        <CardHeader title="This Week" icon={CheckSquare} />
        <div className="flex gap-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const done = i < 5;
            const isToday = i === 5;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className={`text-[10px] ${isToday ? 'text-primary-light font-bold' : 'text-slate-500'}`}>
                  {day}
                </span>
                <div
                  className={`h-8 w-8 rounded-lg ${
                    done
                      ? 'bg-emerald-500/20 border border-emerald-500/40'
                      : isToday
                        ? 'bg-primary/20 border border-primary/40'
                        : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
