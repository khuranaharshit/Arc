import { BookOpen, ExternalLink, CheckCircle, Clock, BookMarked } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';

const MOCK_BOOKS = [
  { key: 'deep_work', title: 'Deep Work', author: 'Cal Newport', status: 'reading', progress: 'Chapter 8', audiobook: true },
  { key: 'thinking_fast_slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', status: 'next', progress: null, audiobook: true },
  { key: 'scout_mindset', title: 'The Scout Mindset', author: 'Julia Galef', status: 'next', progress: null, audiobook: true },
  { key: 'why_we_sleep', title: 'Why We Sleep', author: 'Matthew Walker', status: 'next', progress: null, audiobook: true },
  { key: 'how_to_solve_it', title: 'How to Solve It', author: 'George Polya', status: 'next', progress: null, audiobook: false },
  { key: 'never_split', title: 'Never Split the Difference', author: 'Chris Voss', status: 'next', progress: null, audiobook: true },
];

const statusConfig = {
  finished: { label: 'Finished', color: 'success', icon: CheckCircle },
  reading: { label: 'Reading', color: 'primary', icon: BookMarked },
  next: { label: 'Up Next', color: 'slate', icon: Clock },
};

export function ReadingList() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Reading List</h1>
        <p className="text-sm text-slate-400">12 books to sharpen your mind.</p>
      </div>

      <div className="space-y-3">
        {MOCK_BOOKS.map((book, i) => {
          const sc = statusConfig[book.status];
          const Icon = sc.icon;
          return (
            <Card key={book.key} hover>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-9 items-center justify-center rounded-md bg-slate-700/50 text-lg font-bold text-slate-500">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">{book.title}</h3>
                    {book.audiobook && <Badge color="info">Audio</Badge>}
                  </div>
                  <p className="text-xs text-slate-400">{book.author}</p>
                  {book.progress && (
                    <p className="mt-1 text-xs text-primary">{book.progress}</p>
                  )}
                </div>
                <Badge color={sc.color} icon={Icon}>
                  {sc.label}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
