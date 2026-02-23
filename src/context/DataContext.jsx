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
        const devAvailable = await devStorage.isAvailable();
        if (devAvailable) {
          remoteStorage = devStorage;
          setStorageMode('dev');
          console.log('[Arc] Dev storage server detected — syncing to ./data/ files');
        }
      }

      const syncEngine = new SyncEngine(localCache, remoteStorage);
      if (remoteStorage) {
        try { await syncEngine.fullPull(); } catch (err) { console.warn('[Arc] Pull failed:', err); }
      }

      const activityDAO = new ActivityDAO(localCache, syncEngine);
      const streakDAO = new StreakDAO(localCache, syncEngine);
      const levelDAO = new LevelDAO(localCache, syncEngine);
      const achievementDAO = new AchievementDAO(localCache, syncEngine);
      const reviewDAO = new ReviewDAO(localCache, syncEngine);
      const readingListDAO = new ReadingListDAO(localCache, syncEngine);
      const habitDAO = new HabitDAO(localCache, syncEngine);
      const moodDAO = new MoodDAO(localCache, syncEngine);
      const goalDAO = new GoalDAO(localCache, syncEngine);
      const journalDAO = new JournalDAO(localCache, syncEngine);
      const peopleDAO = new PeopleDAO(localCache, syncEngine);
      const financeDAO = new FinanceDAO(localCache, syncEngine);
      const travelDAO = new TravelDAO(localCache, syncEngine);

      daosRef.current = {
        localCache, syncEngine,
        activityDAO, streakDAO, levelDAO, achievementDAO,
        reviewDAO, readingListDAO, habitDAO,
        moodDAO, goalDAO, journalDAO, peopleDAO, financeDAO, travelDAO,
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
