import { useState, useEffect } from 'react';
import { Plane, Plus, MapPin, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export function TravelLog() {
  const { travelDAO } = useData();
  const { addToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ destination: '', startDate: '', endDate: '', places: '', notes: '' });

  useEffect(() => { travelDAO.getTrips().then(setTrips); }, [travelDAO]);

  const handleAdd = async () => {
    if (!form.destination.trim() || !form.startDate) return addToast('Destination and start date required', 'error');
    await travelDAO.addTrip({
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate || null,
      places: form.places.split(',').map((p) => p.trim()).filter(Boolean),
      notes: form.notes,
    });
    setTrips(await travelDAO.getTrips());
    setForm({ destination: '', startDate: '', endDate: '', places: '', notes: '' });
    setShowAdd(false);
    addToast('Trip added!', 'success');
  };

  const deleteTrip = async (id) => {
    await travelDAO.deleteTrip(id);
    setTrips(await travelDAO.getTrips());
    addToast('Trip removed', 'info');
  };

  const upcoming = trips.filter((t) => t.status === 'upcoming');
  const completed = trips.filter((t) => t.status === 'completed');

  const renderTrip = (trip) => (
    <Card key={trip.id}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-sm font-bold t-primary">{trip.destination}</h3>
          <p className="text-xs t-muted">{trip.start_date}{trip.end_date ? ` → ${trip.end_date}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={trip.status === 'upcoming' ? 'primary' : 'success'}>
            {trip.status === 'upcoming' ? 'Upcoming' : 'Done'}
          </Badge>
          <button onClick={() => deleteTrip(trip.id)} className="t-faint hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {trip.places.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {trip.places.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'var(--color-surface-row)', color: 'var(--text-tertiary)' }}>
              <MapPin className="h-2.5 w-2.5" /> {p}
            </span>
          ))}
        </div>
      )}
      {trip.notes && <p className="text-xs t-tertiary mt-2">{trip.notes}</p>}
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold t-primary">Travel</h1>
          <p className="text-sm t-muted">{trips.length} trips logged</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Trip
        </button>
      </div>

      {trips.length === 0 && (
        <Card><p className="text-center text-sm t-muted py-8">No trips yet. Log your adventures!</p></Card>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-purple-400">Upcoming</h2>
          <div className="space-y-3">{upcoming.map(renderTrip)}</div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-emerald-400">Completed</h2>
          <div className="space-y-3">{completed.map(renderTrip)}</div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Trip">
        <div className="space-y-3">
          <input type="text" className="input-field" placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <input type="date" className="input-field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <input type="text" className="input-field text-xs" placeholder="Places to visit (comma-separated)" value={form.places} onChange={(e) => setForm({ ...form, places: e.target.value })} />
          <textarea className="input-field text-xs" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button onClick={handleAdd} className="btn-primary w-full">Add Trip</button>
        </div>
      </Modal>
    </div>
  );
}
