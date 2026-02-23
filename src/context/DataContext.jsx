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
import { ConfigLoader } from '../dao/ConfigLoader';

const DataContext = createContext(null);

/**
 * Initializes all DAOs with localStorage + optional DevStorage/GitHubStorage.
 * In dev mode, auto-detects if dev-server.js is running and syncs to filesystem.
 * Provides config + DAOs to the entire app.
 */
export function DataProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState(null);
  const [storageMode, setStorageMode] = useState('local'); // 'local' | 'dev' | 'github'
  const daosRef = useRef(null);

  useEffect(() => {
    async function init() {
      const localCache = new LocalCacheStorage();

      // In dev mode, check if dev-server.js is running
      let remoteStorage = null;
      if (import.meta.env.DEV) {
        const devStorage = new DevStorage('http://localhost:3001');
        const devAvailable = await devStorage.isAvailable();
        if (devAvailable) {
          remoteStorage = devStorage;
          setStorageMode('dev');
          console.log('[Arc] Dev storage server detected — syncing to ./data/ files');
        } else {
          console.log('[Arc] No dev storage server — using localStorage only');
          console.log('[Arc] To enable file sync: node dev-server.js');
        }
      }

      const syncEngine = new SyncEngine(localCache, remoteStorage);

      // If dev storage is available, pull existing data from files
      if (remoteStorage) {
        try {
          await syncEngine.fullPull();
        } catch (err) {
          console.warn('[Arc] Initial pull from dev storage failed:', err);
        }
      }

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
      setReady(true);
    });
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
