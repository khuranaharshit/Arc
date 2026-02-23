import { TodayXP } from './TodayXP';
import { StreakCard } from './StreakCard';
import { LevelCard } from './LevelCard';
import { QuestCard } from './QuestCard';
import { QuickLog } from './QuickLog';
import { BrainBite } from './BrainBite';
import { DidYouKnow } from './DidYouKnow';
import { CalibrationCard } from './CalibrationCard';
import { MentalModelCard } from './MentalModelCard';
import { NudgeCard } from './NudgeCard';
import { RecentActivity } from './RecentActivity';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold t-primary">{getGreeting()}</h1>
        <p className="text-sm t-muted">Let's earn some XP today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TodayXP />
        <StreakCard />
        <LevelCard />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuestCard />
        <NudgeCard />
      </div>

      <QuickLog />

      <div className="grid gap-4 sm:grid-cols-2">
        <BrainBite />
        <CalibrationCard />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DidYouKnow />
        <MentalModelCard />
      </div>

      <RecentActivity />
    </div>
  );
}
