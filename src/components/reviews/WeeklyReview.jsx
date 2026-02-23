import { useState, useEffect } from 'react';
import { ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { getWeekString } from '../../utils/dates';

const AREAS = [
  { key: 'health', label: 'Health & Body' },
  { key: 'focus', label: 'Focus & Productivity' },
  { key: 'logic', label: 'Logic & Problem Solving' },
  { key: 'learning', label: 'Learning & Reading' },
  { key: 'relationships', label: 'Relationships' },
];

export function WeeklyReview() {
  const { reviewDAO, activityDAO } = useData();
  const { addToast } = useToast();
  const [scores, setScores] = useState({});
  const [win, setWin] = useState('');
  const [fix, setFix] = useState('');
  const [book, setBook] = useState('');
  const [bookProgress, setBookProgress] = useState('');
  const [pastReviews, setPastReviews] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [weeklyXP, setWeeklyXP] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    reviewDAO.getReviews().then(setPastReviews);
    activityDAO.getXPHistory(7).then((h) => setWeeklyXP(Math.round(h.reduce((s, d) => s + d.xp, 0))));
  }, [reviewDAO, activityDAO]);

  // Check if already submitted this week
  const currentWeek = getWeekString();
  const alreadySubmitted = pastReviews.some((r) => r.week === currentWeek);

  const handleSubmit = async () => {
    const missing = AREAS.filter((a) => !scores[a.key]);
    if (missing.length > 0) return addToast(`Rate all areas first (missing: ${missing.map(m => m.label).join(', ')})`, 'error');

    try {
      await reviewDAO.submitReview({ scores, win, fix, currentBook: book, bookProgress, weeklyXP });
      addToast('Weekly review submitted! +5 XP', 'xp');
      setSubmitted(true);
      setPastReviews(await reviewDAO.getReviews());
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">Weekly Review</h1>
        <p className="text-sm t-muted">Reflect on your week. {weeklyXP} XP earned this week.</p>
      </div>

      {(alreadySubmitted || submitted) ? (
        <Card>
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="text-4xl">✅</div>
            <h3 className="text-lg font-bold t-primary">Review submitted for {currentWeek}</h3>
            <p className="text-sm t-muted">Great job reflecting. See you next week!</p>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Week ${currentWeek.split('W')[1]} Review`} icon={ClipboardCheck}
            subtitle={`${weeklyXP} XP this week`} />
          <div className="space-y-5">
            {AREAS.map((area) => (
              <div key={area.key}>
                <label className="mb-2 block text-sm font-medium t-secondary">{area.label}</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setScores((s) => ({ ...s, [area.key]: n }))}
                      className={`flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-[0.95] ${
                        scores[area.key] === n
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 't-muted'
                      }`}
                      style={scores[area.key] !== n ? { background: 'var(--color-surface-row)', borderColor: 'var(--color-border)' } : {}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-sm font-medium t-secondary">Biggest win this week</label>
              <input type="text" className="input-field" placeholder="What went well?" value={win} onChange={(e) => setWin(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium t-secondary">One thing to fix next week</label>
              <input type="text" className="input-field" placeholder="What needs improvement?" value={fix} onChange={(e) => setFix(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium t-secondary">Current book</label>
                <input type="text" className="input-field" placeholder="Title" value={book} onChange={(e) => setBook(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium t-secondary">Progress</label>
                <input type="text" className="input-field" placeholder="Chapter 5" value={bookProgress} onChange={(e) => setBookProgress(e.target.value)} />
              </div>
            </div>

            <button onClick={handleSubmit} className="btn-primary w-full">Submit Review</button>
          </div>
        </Card>
      )}

      {/* Past reviews */}
      {pastReviews.length > 0 && (
        <div>
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium t-tertiary hover:t-secondary transition-colors mb-3">
            {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Past Reviews ({pastReviews.length})
          </button>
          {showHistory && (
            <div className="space-y-3">
              {[...pastReviews].reverse().map((r) => (
                <Card key={r.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold t-primary">{r.week}</span>
                    <div className="flex gap-1">
                      <Badge color="primary">{r.total_score}/25</Badge>
                      <Badge color="info">{r.weekly_xp} XP</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {AREAS.map((a) => (
                      <div key={a.key} className="text-center">
                        <div className="text-lg font-bold t-primary">{r.scores[a.key] || '-'}</div>
                        <div className="text-[9px] t-muted">{a.label.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                  {r.win && <p className="text-xs t-secondary">Win: {r.win}</p>}
                  {r.fix && <p className="text-xs t-muted">Fix: {r.fix}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
