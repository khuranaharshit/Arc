/**
 * Base DAO — provides read/write with localStorage + sync.
 * All domain DAOs extend this.
 */
export class BaseDAO {
  /**
   * @param {import('../storage/LocalCacheStorage').LocalCacheStorage} localCache
   * @param {import('../storage/SyncEngine').SyncEngine} syncEngine
   * @param {string} storageKey — e.g. "daily-log", "streaks"
   */
  constructor(localCache, syncEngine, storageKey) {
    this.localCache = localCache;
    this.syncEngine = syncEngine;
    this.storageKey = storageKey;
  }

  async getData() {
    const data = await this.localCache.read(this.storageKey);
    return data || this.getDefaultData();
  }

  async saveData(data) {
    await this.localCache.write(this.storageKey, data);
    // Fire-and-forget push to GitHub (no-ops if not configured)
    this.syncEngine.pushKey(this.storageKey).catch(() => {});
  }

  /** Override in subclass to provide empty default schema */
  getDefaultData() {
    return { version: 1 };
  }
}
