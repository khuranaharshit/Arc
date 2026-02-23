import { TodayXP } from './TodayXP';
import { StreakCard } from './StreakCard';
import { LevelCard } from './LevelCard';
import { QuickLog } from './QuickLog';
import { BrainBite } from './BrainBite';
import { DidYouKnow } from './DidYouKnow';
import { CalibrationCard } from './CalibrationCard';
import { MentalModelCard } from './MentalModelCard';
import { RecentActivity } from './RecentActivity';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Good morning</h1>
        <p className="text-sm text-slate-400">Let's earn some XP today.</p>
      </div>

      {/* Top row: XP + Streak + Level */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TodayXP />
        <StreakCard />
        <LevelCard />
      </div>

      {/* Quick log */}
      <QuickLog />

      {/* Knowledge & puzzles row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <BrainBite />
        <CalibrationCard />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DidYouKnow />
        <MentalModelCard />
      </div>

      {/* Recent activity */}
      <RecentActivity />
    </div>
  );
}
