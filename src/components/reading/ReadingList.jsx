import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, BookMarked, ExternalLink } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const statusConfig = {
  finished: { label: 'Finished', color: 'success', icon: CheckCircle },
  reading: { label: 'Reading', color: 'primary', icon: BookMarked },
  next: { label: 'Up Next', color: 'slate', icon: Clock },
};

export function ReadingList() {
  const { readingListDAO, config } = useData();
  const { addToast } = useToast();
  const [userBooks, setUserBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [progressNote, setProgressNote] = useState('');

  const configBooks = config.readingList.books;

  useEffect(() => {
    readingListDAO.getAllBooks().then(setUserBooks);
  }, [readingListDAO]);

  const getStatus = (configKey) => {
    const ub = userBooks.find((b) => b.config_key === configKey);
    return ub?.status || 'next';
  };
  const getProgress = (configKey) => {
    const ub = userBooks.find((b) => b.config_key === configKey);
    return ub?.progress_note || null;
  };

  const updateStatus = async (configKey, status) => {
    await readingListDAO.updateBookStatus(configKey, status, status === 'reading' ? progressNote : null);
    setUserBooks(await readingListDAO.getAllBooks());
    if (status === 'finished') addToast('Book finished! +20 XP', 'xp');
    else if (status === 'reading') addToast('Started reading!', 'success');
    setSelectedBook(null);
    setProgressNote('');
  };

  const updateProgress = async () => {
    if (!selectedBook || !progressNote) return;
    await readingListDAO.updateBookStatus(selectedBook.key, 'reading', progressNote);
    setUserBooks(await readingListDAO.getAllBooks());
    addToast('Progress updated', 'success');
    setSelectedBook(null);
    setProgressNote('');
  };

  const finished = configBooks.filter((b) => getStatus(b.key) === 'finished');
  const reading = configBooks.filter((b) => getStatus(b.key) === 'reading');
  const next = configBooks.filter((b) => getStatus(b.key) === 'next');

  const renderBook = (book, i) => {
    const status = getStatus(book.key);
    const progress = getProgress(book.key);
    const sc = statusConfig[status];
    const Icon = sc.icon;
    return (
      <Card key={book.key} hover onClick={() => { setSelectedBook(book); setProgressNote(progress || ''); }} className="cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-lg font-bold t-faint">
            {book.order}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold t-primary">{book.title}</h3>
              {book.audiobook && <Badge color="info">Audio</Badge>}
            </div>
            <p className="text-xs t-muted">{book.author}</p>
            {progress && <p className="mt-1 text-xs text-purple-400">{progress}</p>}
          </div>
          <Badge color={sc.color} icon={Icon}>{sc.label}</Badge>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Reading List</h1>
        <p className="text-sm t-muted">{finished.length}/{configBooks.length} books finished</p>
      </div>

      {reading.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-purple-400">Currently Reading</h2>
          <div className="space-y-2">{reading.map(renderBook)}</div>
        </div>
      )}

      {next.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold t-tertiary">Up Next</h2>
          <div className="space-y-2">{next.map(renderBook)}</div>
        </div>
      )}

      {finished.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-emerald-400">Finished</h2>
          <div className="space-y-2">{finished.map(renderBook)}</div>
        </div>
      )}

      <Modal isOpen={!!selectedBook} onClose={() => setSelectedBook(null)} title={selectedBook?.title || ''}>
        {selectedBook && (
          <div className="space-y-4">
            <p className="text-xs t-muted">{selectedBook.author}</p>
            <div>
              <label className="block text-sm font-medium t-secondary mb-1">Progress note</label>
              <input type="text" className="input-field" placeholder="e.g. Chapter 5" value={progressNote} onChange={(e) => setProgressNote(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {getStatus(selectedBook.key) === 'next' && (
                <button onClick={() => updateStatus(selectedBook.key, 'reading')} className="btn-primary flex-1">Start Reading</button>
              )}
              {getStatus(selectedBook.key) === 'reading' && (
                <>
                  <button onClick={updateProgress} className="btn-secondary flex-1">Update Progress</button>
                  <button onClick={() => updateStatus(selectedBook.key, 'finished')} className="btn-primary flex-1">Mark Finished</button>
                </>
              )}
              {selectedBook.url && (
                <a href={selectedBook.url} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1">
                  <ExternalLink className="h-3.5 w-3.5" /> Buy
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
