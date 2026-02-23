import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppShell } from './components/layout/AppShell';
import { LoginScreen } from './components/auth/LoginScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { ActivityMenu } from './components/activities/ActivityMenu';
import { GameHub } from './components/games/GameHub';
import { GameSession } from './components/games/GameSession';
import { StatsPage } from './components/stats/StatsPage';
import { WeeklyReview } from './components/reviews/WeeklyReview';
import { ReadingList } from './components/reading/ReadingList';
import { AchievementList } from './components/achievements/AchievementList';
import { HabitTracker } from './components/tracking/HabitTracker';
import { MoodLogger } from './components/tracking/MoodLogger';
import { GoalsBoard } from './components/tracking/GoalsBoard';
import { JournalPage } from './components/tracking/JournalPage';
import { PeoplePage } from './components/tracking/PeoplePage';
import { FinancePulse } from './components/tracking/FinancePulse';
import { TravelLog } from './components/tracking/TravelLog';
import { ExportPage } from './components/export/ExportPage';
import { SettingsPage } from './components/settings/SettingsPage';

function AppRoutes() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="log" element={<ActivityMenu />} />
            <Route path="games" element={<GameHub />} />
            <Route path="games/:gameType" element={<GameSession />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="review" element={<WeeklyReview />} />
            <Route path="reading" element={<ReadingList />} />
            <Route path="achievements" element={<AchievementList />} />
            <Route path="tracking/habits" element={<HabitTracker />} />
            <Route path="tracking/mood" element={<MoodLogger />} />
            <Route path="tracking/goals" element={<GoalsBoard />} />
            <Route path="tracking/journal" element={<JournalPage />} />
            <Route path="tracking/people" element={<PeoplePage />} />
            <Route path="tracking/finance" element={<FinancePulse />} />
            <Route path="tracking/travel" element={<TravelLog />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

function AuthGate() {
  const { isAuthed } = useAuth();

  // In dev mode, skip auth gate — use localStorage directly
  if (import.meta.env.DEV) {
    return <AppRoutes />;
  }

  // In production, require auth
  if (!isAuthed) {
    return <LoginScreen />;
  }

  return <AppRoutes />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
