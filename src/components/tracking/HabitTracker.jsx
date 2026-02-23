import { useState } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useToast } from '../../context/ToastContext';

const INITIAL_HABITS = [
  { key: 'drink_water', label: 'Drink 2L water', icon: '💧', checked: false },
  { key: 'meditate', label: 'Meditate 10 min', icon: '🧘', checked: false },
  { key: 'vitamins', label: 'Take vitamins', icon: '💊', checked: false },
  { key: 'no_snooze', label: 'No snooze alarm', icon: '⏰', checked: false },
  { key: 'stretch', label: 'Morning stretch', icon: '🙆', checked: false },
];

export function HabitTracker() {
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const { addToast } = useToast();

  const toggleHabit = (key) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.key !== key) return h;
        const next = !h.checked;
        if (next) addToast(`${h.icon} ${h.label} — done!`, 'success');
        return { ...h, checked: next };
      }),
    );
  };

  const doneCount = habits.filter((h) => h.checked).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Habits</h1>
          <p className="text-sm text-white/30">
            {doneCount}/{habits.length} done today
          </p>
        </div>
        <button className="btn-ghost">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => (
          <Card key={habit.key} hover onClick={() => toggleHabit(habit.key)} className="cursor-pointer">
            <div className="flex items-center gap-3">
              <button
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                  habit.checked
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-white/20 hover:border-white/20'
                }`}
              >
                {habit.checked && <CheckSquare className="h-4 w-4" />}
              </button>
              <span className="text-lg">{habit.icon}</span>
              <span
                className={`text-sm font-medium transition-all ${
                  habit.checked ? 'text-white/30 line-through' : 'text-white/70'
                }`}
              >
                {habit.label}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Weekly calendar */}
      <Card>
        <CardHeader title="This Week" icon={CheckSquare} />
        <div className="flex gap-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const done = i < 5;
            const isToday = i === 5;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className={`text-[10px] font-medium ${isToday ? 'text-purple-400' : 'text-white/25'}`}>
                  {day}
                </span>
                <div
                  className={`h-8 w-8 rounded-xl transition-all ${
                    done
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : isToday
                        ? 'bg-purple-500/20 border border-purple-500/30 animate-pulse-glow'
                        : 'bg-white/5 border border-white/5'
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
