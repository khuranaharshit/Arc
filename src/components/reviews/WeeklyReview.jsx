import { ClipboardCheck } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';

export function WeeklyReview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Weekly Review</h1>
        <p className="text-sm text-slate-400">Reflect on your week.</p>
      </div>

      <Card>
        <CardHeader title="Week 8 Review" icon={ClipboardCheck} subtitle="Feb 17 - Feb 23, 2026" />

        <div className="space-y-4">
          {/* Score sliders */}
          {['Health & Body', 'Focus & Productivity', 'Logic & Problem Solving', 'Learning & Reading', 'Relationships'].map(
            (area, i) => (
              <div key={area}>
                <label className="mb-1.5 block text-sm text-slate-300">{area}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      className="flex h-9 flex-1 items-center justify-center rounded-lg border border-slate-600 bg-slate-800/50 text-sm font-medium text-slate-400 transition-all hover:bg-primary/20 hover:text-primary-light hover:border-primary/50"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ),
          )}

          {/* Text fields */}
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Biggest win this week</label>
            <input type="text" className="input-field" placeholder="What went well?" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">One thing to fix next week</label>
            <input type="text" className="input-field" placeholder="What needs improvement?" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Current book</label>
            <input type="text" className="input-field" placeholder="What are you reading?" />
          </div>

          <button className="btn-primary w-full">Submit Review</button>
        </div>
      </Card>
    </div>
  );
}
