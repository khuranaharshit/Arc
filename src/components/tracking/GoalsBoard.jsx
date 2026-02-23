import { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export function GoalsBoard() {
  const { goalDAO } = useData();
  const { addToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMilestone, setNewMilestone] = useState({});

  useEffect(() => { goalDAO.getGoals().then(setGoals); }, [goalDAO]);

  const addGoal = async () => {
    if (!newTitle.trim()) return;
    await goalDAO.addGoal(newTitle.trim());
    setGoals(await goalDAO.getGoals());
    setNewTitle('');
    setShowAdd(false);
    addToast('Goal added!', 'success');
  };

  const addMilestone = async (goalId) => {
    const text = newMilestone[goalId]?.trim();
    if (!text) return;
    await goalDAO.addMilestone(goalId, text);
    setGoals(await goalDAO.getGoals());
    setNewMilestone((p) => ({ ...p, [goalId]: '' }));
  };

  const toggleMilestone = async (goalId, idx) => {
    const completed = await goalDAO.toggleMilestone(goalId, idx);
    if (completed) addToast('+15 XP — Milestone completed!', 'xp');
    setGoals(await goalDAO.getGoals());
  };

  const deleteGoal = async (goalId) => {
    await goalDAO.deleteGoal(goalId);
    setGoals(await goalDAO.getGoals());
    addToast('Goal removed', 'info');
  };

  const active = goals.filter((g) => g.status === 'in_progress');
  const completed = goals.filter((g) => g.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold t-primary">Goals</h1>
          <p className="text-sm t-muted">{active.length} active, {completed.length} completed</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Goal
        </button>
      </div>

      {goals.length === 0 && (
        <Card>
          <p className="text-center text-sm t-muted py-8">No goals yet. Add your first quarterly goal!</p>
        </Card>
      )}

      {active.map((goal) => {
        const done = goal.milestones.filter((m) => m.completed).length;
        const total = goal.milestones.length;
        return (
          <Card key={goal.id}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold t-primary">{goal.title}</h3>
                <Badge color="info">{goal.quarter}</Badge>
              </div>
              <button onClick={() => deleteGoal(goal.id)} className="t-faint hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {total > 0 && <ProgressBar value={done} max={total} gradient="from-purple-500 to-pink-500" size="sm" showLabel label={`${done}/${total} milestones`} className="mb-3" />}
            <div className="space-y-1.5">
              {goal.milestones.map((m, idx) => (
                <button key={idx} onClick={() => toggleMilestone(goal.id, idx)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-all surface-row">
                  {m.completed ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" /> : <Circle className="h-4 w-4 t-faint shrink-0" />}
                  <span className={`text-sm ${m.completed ? 't-muted line-through' : 't-secondary'}`}>{m.title}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input type="text" className="input-field text-xs" placeholder="Add milestone..."
                value={newMilestone[goal.id] || ''}
                onChange={(e) => setNewMilestone((p) => ({ ...p, [goal.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addMilestone(goal.id)} />
              <button onClick={() => addMilestone(goal.id)} className="btn-ghost text-xs shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        );
      })}

      {completed.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-emerald-400">Completed</h2>
          {completed.map((goal) => (
            <Card key={goal.id} className="opacity-60 mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium t-secondary line-through">{goal.title}</span>
                <Badge color="success">{goal.quarter}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Goal">
        <div className="space-y-3">
          <input type="text" className="input-field" placeholder="e.g. Ship side project" value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addGoal()} />
          <button onClick={addGoal} className="btn-primary w-full">Create Goal</button>
        </div>
      </Modal>
    </div>
  );
}
