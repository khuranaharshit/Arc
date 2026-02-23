import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LocalCacheStorage } from '../storage/LocalCacheStorage';
import { SyncEngine } from '../storage/SyncEngine';
import { ActivityDAO } from '../dao/ActivityDAO';
import { StreakDAO } from '../dao/StreakDAO';
import { LevelDAO } from '../dao/LevelDAO';
import { AchievementDAO } from '../dao/AchievementDAO';
import { ReviewDAO } from '../dao/ReviewDAO';
import { ReadingListDAO } from '../dao/ReadingListDAO';
import { HabitDAO } from '../dao/HabitDAO';
import { ConfigLoader } from '../dao/ConfigLoader';

const DataContext = createContext(null);

/**
 * Initializes all DAOs with localStorage storage (GitHub added later via auth).
 * Provides config + DAOs to the entire app.
 */
export function DataProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState(null);
  const daosRef = useRef(null);

  useEffect(() => {
    async function init() {
      // Create storage + sync
      const localCache = new LocalCacheStorage();
      const syncEngine = new SyncEngine(localCache, null); // no GitHub yet

      // Create DAOs
      const activityDAO = new ActivityDAO(localCache, syncEngine);
      const streakDAO = new StreakDAO(localCache, syncEngine);
      const levelDAO = new LevelDAO(localCache, syncEngine);
      const achievementDAO = new AchievementDAO(localCache, syncEngine);
      const reviewDAO = new ReviewDAO(localCache, syncEngine);
      const readingListDAO = new ReadingListDAO(localCache, syncEngine);
      const habitDAO = new HabitDAO(localCache, syncEngine);

      daosRef.current = {
        localCache,
        syncEngine,
        activityDAO,
        streakDAO,
        levelDAO,
        achievementDAO,
        reviewDAO,
        readingListDAO,
        habitDAO,
      };

      // Load configs
      const [xpMenu, levels, streaks, achievements, readingList, nudges] = await Promise.all([
        ConfigLoader.xpMenu(),
        ConfigLoader.levels(),
        ConfigLoader.streaks(),
        ConfigLoader.achievements(),
        ConfigLoader.readingList(),
        ConfigLoader.nudges(),
      ]);

      setConfig({ xpMenu, levels, streaks, achievements, readingList, nudges });
      setReady(true);
    }

    init().catch((err) => {
      console.error('DataProvider init failed:', err);
      setReady(true); // still render app, just without data
    });
  }, []);

  if (!ready) return null; // or loading screen

  return (
    <DataContext.Provider value={{ ...daosRef.current, config }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
