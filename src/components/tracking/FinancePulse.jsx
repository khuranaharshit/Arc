import { useState, useEffect } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function FinancePulse() {
  const { financeDAO } = useData();
  const { addToast } = useToast();
  const [snapshots, setSnapshots] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    month: currentMonth(), savingsGoal: '', savingsCurrent: '',
    financialAction: '', futureGoals: '', notes: '',
  });

  useEffect(() => { financeDAO.getSnapshots().then(setSnapshots); }, [financeDAO]);

  const handleSave = async () => {
    await financeDAO.addSnapshot({
      month: form.month,
      savingsGoal: Number(form.savingsGoal) || 0,
      savingsCurrent: Number(form.savingsCurrent) || 0,
      financialAction: form.financialAction,
      futureGoals: form.futureGoals.split(',').map((g) => g.trim()).filter(Boolean),
      notes: form.notes,
    });
    setSnapshots(await financeDAO.getSnapshots());
    setShowAdd(false);
    addToast('Financial snapshot saved!', 'success');
  };

  const latest = snapshots[snapshots.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold t-primary">Finance</h1>
          <p className="text-sm t-muted">Monthly savings pulse.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> {latest ? 'Update' : 'Add'} Snapshot
        </button>
      </div>

      {latest ? (
        <Card>
          <CardHeader title={latest.month} icon={Wallet} subtitle="Current snapshot" />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="t-secondary">Savings Progress</span>
                <span className="t-primary font-bold">{latest.savings_current.toLocaleString()} / {latest.savings_goal.toLocaleString()}</span>
              </div>
              <ProgressBar value={latest.savings_current} max={latest.savings_goal || 1} gradient="from-emerald-500 to-teal-500" size="lg" />
            </div>
            {latest.financial_action && (
              <div>
                <h4 className="text-xs font-medium t-muted mb-1">Action this month</h4>
                <p className="text-sm t-secondary">{latest.financial_action}</p>
              </div>
            )}
            {latest.future_goals?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium t-muted mb-1">Goals</h4>
                <ul className="space-y-1">
                  {latest.future_goals.map((g, i) => (
                    <li key={i} className="text-sm t-tertiary">• {g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card><p className="text-center text-sm t-muted py-8">No financial snapshots yet.</p></Card>
      )}

      {snapshots.length > 1 && (
        <Card>
          <CardHeader title="History" icon={Wallet} />
          <div className="space-y-2">
            {[...snapshots].reverse().slice(1).map((s) => (
              <div key={s.month} className="surface-row">
                <span className="text-sm t-secondary">{s.month}</span>
                <span className="text-sm font-bold t-primary">{s.savings_current.toLocaleString()} / {s.savings_goal.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Financial Snapshot">
        <div className="space-y-3">
          <input type="month" className="input-field" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className="input-field" placeholder="Savings goal" value={form.savingsGoal} onChange={(e) => setForm({ ...form, savingsGoal: e.target.value })} />
            <input type="number" className="input-field" placeholder="Current savings" value={form.savingsCurrent} onChange={(e) => setForm({ ...form, savingsCurrent: e.target.value })} />
          </div>
          <input type="text" className="input-field" placeholder="Key financial action this month" value={form.financialAction} onChange={(e) => setForm({ ...form, financialAction: e.target.value })} />
          <input type="text" className="input-field text-xs" placeholder="Future goals (comma-separated)" value={form.futureGoals} onChange={(e) => setForm({ ...form, futureGoals: e.target.value })} />
          <textarea className="input-field text-xs" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button onClick={handleSave} className="btn-primary w-full">Save Snapshot</button>
        </div>
      </Modal>
    </div>
  );
}
