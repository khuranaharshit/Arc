import { useState, useEffect } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const DEFAULT_HABITS = [
  { key: 'drink_water', label: 'Drink 2L water', icon: '💧' },
  { key: 'meditate', label: 'Meditate 10 min', icon: '🧘' },
  { key: 'vitamins', label: 'Take vitamins', icon: '💊' },
  { key: 'no_snooze', label: 'No snooze alarm', icon: '⏰' },
  { key: 'stretch', label: 'Morning stretch', icon: '🙆' },
];

export function HabitTracker() {
  const { habitDAO } = useData();
  const { addToast } = useToast();
  const [habits, setHabits] = useState([]);
  const [todayLog, setTodayLog] = useState({});

  useEffect(() => {
    async function load() {
      let defs = await habitDAO.getHabits();
      if (defs.length === 0) {
        // Initialize with defaults
        for (const h of DEFAULT_HABITS) {
          await habitDAO.addHabit(h.key, h.label, h.icon);
        }
        defs = await habitDAO.getHabits();
      }
      setHabits(defs);
      setTodayLog(await habitDAO.getTodayLog());
    }
    load();
  }, [habitDAO]);

  const toggle = async (key) => {
    const newVal = await habitDAO.toggleHabit(key);
    setTodayLog((prev) => ({ ...prev, [key]: newVal }));
    if (newVal) {
      const h = habits.find((x) => x.key === key);
      addToast(`${h?.icon || '✅'} ${h?.label || key} — done!`, 'success');
    }
  };

  const doneCount = Object.values(todayLog).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold t-primary">Habits</h1>
          <p className="text-sm t-muted">{doneCount}/{habits.length} done today</p>
        </div>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => {
          const done = !!todayLog[habit.key];
          return (
            <Card key={habit.key} hover onClick={() => toggle(habit.key)} className="cursor-pointer">
              <div className="flex items-center gap-3">
                <button className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                  done ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400' : 't-faint'
                }`} style={!done ? { borderColor: 'var(--color-border)', background: 'var(--color-surface-row)' } : {}}>
                  {done && <CheckSquare className="h-4 w-4" />}
                </button>
                <span className="text-lg">{habit.icon}</span>
                <span className={`text-sm font-medium transition-all ${done ? 't-muted line-through' : 't-secondary'}`}>{habit.label}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
