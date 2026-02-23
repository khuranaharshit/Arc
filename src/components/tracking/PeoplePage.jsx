import { useState, useEffect } from 'react';
import { Users, Plus, Phone, Trash2, Gift } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { relativeDate } from '../../utils/dates';

export function PeoplePage() {
  const { peopleDAO } = useData();
  const { addToast } = useToast();
  const [people, setPeople] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', birthday: '', notes: '', tags: '' });

  useEffect(() => { peopleDAO.getPeople().then(setPeople); }, [peopleDAO]);

  const handleAdd = async () => {
    if (!form.name.trim()) return addToast('Name is required', 'error');
    await peopleDAO.addPerson({
      name: form.name.trim(),
      relationship: form.relationship,
      birthday: form.birthday || null,
      notes: form.notes,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setPeople(await peopleDAO.getPeople());
    setForm({ name: '', relationship: '', birthday: '', notes: '', tags: '' });
    setShowAdd(false);
    addToast('Person added!', 'success');
  };

  const markContacted = async (id) => {
    await peopleDAO.markContacted(id);
    setPeople(await peopleDAO.getPeople());
    addToast('Marked as contacted!', 'success');
  };

  const deletePerson = async (id) => {
    await peopleDAO.deletePerson(id);
    setPeople(await peopleDAO.getPeople());
    addToast('Removed', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold t-primary">People</h1>
          <p className="text-sm t-muted">{people.length} people tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Person
        </button>
      </div>

      {people.length === 0 && (
        <Card><p className="text-center text-sm t-muted py-8">No one added yet. Track the people who matter.</p></Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {people.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold t-primary">{p.name}</h3>
                {p.relationship && <p className="text-xs t-muted">{p.relationship}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => markContacted(p.id)} className="rounded-lg p-1.5 t-muted hover:text-emerald-400 transition-colors" title="Mark contacted">
                  <Phone className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => deletePerson(p.id)} className="rounded-lg p-1.5 t-faint hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {p.birthday && (
              <div className="flex items-center gap-1 text-xs t-muted mb-1">
                <Gift className="h-3 w-3" /> {p.birthday}
              </div>
            )}
            {p.last_contacted && (
              <p className="text-xs t-muted">Last contacted: {relativeDate(p.last_contacted)}</p>
            )}
            {p.notes && <p className="text-xs t-tertiary mt-1">{p.notes}</p>}
            {p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {p.tags.map((t) => <Badge key={t} color="slate">{t}</Badge>)}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Person">
        <div className="space-y-3">
          <input type="text" className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="text" className="input-field" placeholder="Relationship (e.g. close friend)" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          <input type="date" className="input-field" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
          <input type="text" className="input-field" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <input type="text" className="input-field text-xs" placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <button onClick={handleAdd} className="btn-primary w-full">Add Person</button>
        </div>
      </Modal>
    </div>
  );
}
