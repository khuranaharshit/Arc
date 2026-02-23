import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LocalCacheStorage } from '../storage/LocalCacheStorage';
import { SyncEngine } from '../storage/SyncEngine';
import { DevStorage } from '../storage/DevStorage';
import { ActivityDAO } from '../dao/ActivityDAO';
import { StreakDAO } from '../dao/StreakDAO';
import { LevelDAO } from '../dao/LevelDAO';
import { AchievementDAO } from '../dao/AchievementDAO';
import { ReviewDAO } from '../dao/ReviewDAO';
import { ReadingListDAO } from '../dao/ReadingListDAO';
import { HabitDAO } from '../dao/HabitDAO';
import { MoodDAO } from '../dao/MoodDAO';
import { GoalDAO } from '../dao/GoalDAO';
import { JournalDAO } from '../dao/JournalDAO';
import { PeopleDAO } from '../dao/PeopleDAO';
import { FinanceDAO } from '../dao/FinanceDAO';
import { TravelDAO } from '../dao/TravelDAO';
import { QuestDAO } from '../dao/QuestDAO';
import { ChallengeDAO } from '../dao/ChallengeDAO';
import { ConfigLoader } from '../dao/ConfigLoader';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState(null);
  const [storageMode, setStorageMode] = useState('local');
  const daosRef = useRef(null);

  useEffect(() => {
    async function init() {
      const localCache = new LocalCacheStorage();
      let remoteStorage = null;

      if (import.meta.env.DEV) {
        const devStorage = new DevStorage('http://localhost:3001');
        if (await devStorage.isAvailable()) {
          remoteStorage = devStorage;
          setStorageMode('dev');
        }
      }

      const syncEngine = new SyncEngine(localCache, remoteStorage);
      if (remoteStorage) { try { await syncEngine.fullPull(); } catch {} }

      daosRef.current = {
        localCache, syncEngine,
        activityDAO: new ActivityDAO(localCache, syncEngine),
        streakDAO: new StreakDAO(localCache, syncEngine),
        levelDAO: new LevelDAO(localCache, syncEngine),
        achievementDAO: new AchievementDAO(localCache, syncEngine),
        reviewDAO: new ReviewDAO(localCache, syncEngine),
        readingListDAO: new ReadingListDAO(localCache, syncEngine),
        habitDAO: new HabitDAO(localCache, syncEngine),
        moodDAO: new MoodDAO(localCache, syncEngine),
        goalDAO: new GoalDAO(localCache, syncEngine),
        journalDAO: new JournalDAO(localCache, syncEngine),
        peopleDAO: new PeopleDAO(localCache, syncEngine),
        financeDAO: new FinanceDAO(localCache, syncEngine),
        travelDAO: new TravelDAO(localCache, syncEngine),
        questDAO: new QuestDAO(localCache, syncEngine),
        challengeDAO: new ChallengeDAO(localCache, syncEngine),
      };

      const [xpMenu, levels, streaks, achievements, readingList, nudges] = await Promise.all([
        ConfigLoader.xpMenu(), ConfigLoader.levels(), ConfigLoader.streaks(),
        ConfigLoader.achievements(), ConfigLoader.readingList(), ConfigLoader.nudges(),
      ]);

      setConfig({ xpMenu, levels, streaks, achievements, readingList, nudges });
      setReady(true);
    }
    init().catch((err) => { console.error('DataProvider init failed:', err); setReady(true); });
  }, []);

  if (!ready) return null;

  return (
    <DataContext.Provider value={{ ...daosRef.current, config, storageMode }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
