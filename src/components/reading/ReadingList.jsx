import { BookOpen, CheckCircle, Clock, BookMarked } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

const MOCK_BOOKS = [
  { key: 'deep_work', title: 'Deep Work', author: 'Cal Newport', status: 'reading', progress: 'Chapter 8', audiobook: true },
  { key: 'thinking_fast_slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', status: 'next', audiobook: true },
  { key: 'scout_mindset', title: 'The Scout Mindset', author: 'Julia Galef', status: 'next', audiobook: true },
  { key: 'why_we_sleep', title: 'Why We Sleep', author: 'Matthew Walker', status: 'next', audiobook: true },
  { key: 'how_to_solve_it', title: 'How to Solve It', author: 'George Polya', status: 'next', audiobook: false },
  { key: 'never_split', title: 'Never Split the Difference', author: 'Chris Voss', status: 'next', audiobook: true },
];

const statusConfig = {
  finished: { label: 'Finished', color: 'success', icon: CheckCircle },
  reading: { label: 'Reading', color: 'primary', icon: BookMarked },
  next: { label: 'Up Next', color: 'slate', icon: Clock },
};

export function ReadingList() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Reading List</h1>
        <p className="text-sm text-white/30">12 books to sharpen your mind.</p>
      </div>

      <div className="space-y-2">
        {MOCK_BOOKS.map((book, i) => {
          const sc = statusConfig[book.status];
          const Icon = sc.icon;
          return (
            <Card key={book.key} hover className="cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-lg font-bold text-white/20">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white/90">{book.title}</h3>
                    {book.audiobook && <Badge color="info">Audio</Badge>}
                  </div>
                  <p className="text-xs text-white/30">{book.author}</p>
                  {book.progress && <p className="mt-1 text-xs text-purple-400">{book.progress}</p>}
                </div>
                <Badge color={sc.color} icon={Icon}>{sc.label}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
