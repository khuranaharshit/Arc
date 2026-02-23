import { useState, useEffect } from 'react';
import { PenLine, Plus, Search, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { relativeDate } from '../../utils/dates';

export function JournalPage() {
  const { journalDAO } = useData();
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [composing, setComposing] = useState(false);

  useEffect(() => { journalDAO.getEntries().then(setEntries); }, [journalDAO]);

  const handleSave = async () => {
    if (text.trim().length < 3) return addToast('Write at least a few words', 'error');
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    await journalDAO.addEntry(text.trim(), tagList);
    addToast('+4 XP — Journal entry saved!', 'xp');
    setText('');
    setTags('');
    setComposing(false);
    setEntries(await journalDAO.getEntries());
  };

  const handleDelete = async (id) => {
    await journalDAO.deleteEntry(id);
    setEntries(await journalDAO.getEntries());
    addToast('Entry deleted', 'info');
  };

  const filtered = searchQuery
    ? entries.filter((e) => e.text.toLowerCase().includes(searchQuery.toLowerCase()) || e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    : entries;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold t-primary">Journal</h1>
          <p className="text-sm t-muted">{entries.length} entries</p>
        </div>
        <button onClick={() => setComposing(!composing)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New Entry
        </button>
      </div>

      {composing && (
        <Card>
          <textarea className="input-field min-h-[120px] resize-y" placeholder="What's on your mind?" value={text} onChange={(e) => setText(e.target.value)} />
          <input type="text" className="input-field mt-2 text-xs" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <div className="flex gap-2 mt-3">
            <button onClick={() => setComposing(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">Save Entry</button>
          </div>
        </Card>
      )}

      {entries.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 t-muted" />
          <input type="text" className="input-field pl-9" placeholder="Search entries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      )}

      {filtered.length === 0 && (
        <Card><p className="text-center text-sm t-muted py-8">{searchQuery ? 'No matching entries.' : 'No journal entries yet.'}</p></Card>
      )}

      <div className="space-y-3">
        {[...filtered].reverse().map((entry) => (
          <Card key={entry.id}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs t-muted">{relativeDate(entry.date)}</span>
              <button onClick={() => handleDelete(entry.id)} className="t-faint hover:text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm t-secondary whitespace-pre-wrap">{entry.text}</p>
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.tags.map((tag) => <Badge key={tag} color="slate">{tag}</Badge>)}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
