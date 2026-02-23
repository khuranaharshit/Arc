/**
 * SyncEngine orchestrates sync between LocalCacheStorage and GitHubStorage.
 * For now (pre-auth), it only uses localStorage. GitHub sync is added later.
 */
export class SyncEngine {
  constructor(localCache, githubStorage = null) {
    this.localCache = localCache;
    this.githubStorage = githubStorage;
    this.syncStatus = 'idle'; // 'idle' | 'syncing' | 'error'
    this.failedKeys = new Set();
    this._listeners = new Set();
  }

  getStatus() {
    return this.syncStatus;
  }

  onStatusChange(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _setStatus(status) {
    this.syncStatus = status;
    this._listeners.forEach((fn) => fn(status));
  }

  /**
   * Push a single key to GitHub. Called after every DAO write.
   * No-ops if githubStorage is not configured yet.
   */
  async pushKey(key) {
    if (!this.githubStorage) return;

    this._setStatus('syncing');
    try {
      const data = await this.localCache.read(key);
      if (data !== null) {
        await this.githubStorage.write(key, data);
      }
      this.failedKeys.delete(key);
      this._setStatus('idle');
    } catch (err) {
      console.error(`SyncEngine: failed to push ${key}`, err);
      this.failedKeys.add(key);
      this._setStatus('error');
    }
  }

  /**
   * Retry all failed pushes. Called on manual save or app reload.
   */
  async retryFailed() {
    if (!this.githubStorage) return;

    const keys = [...this.failedKeys];
    for (const key of keys) {
      try {
        const data = await this.localCache.read(key);
        if (data !== null) {
          await this.githubStorage.write(key, data);
        }
        this.failedKeys.delete(key);
      } catch (err) {
        console.error(`SyncEngine: retry failed for ${key}`, err);
      }
    }
    this._setStatus(this.failedKeys.size > 0 ? 'error' : 'idle');
  }

  /**
   * Pull ALL data from GitHub to localStorage.
   * Called on app load after auth is established.
   */
  async fullPull() {
    if (!this.githubStorage) return;

    this._setStatus('syncing');
    try {
      const remoteKeys = await this.githubStorage.list();
      for (const key of remoteKeys) {
        const remoteData = await this.githubStorage.read(key);
        if (remoteData !== null) {
          await this.localCache.write(key, remoteData);
        }
      }
      this._setStatus('idle');
    } catch (err) {
      console.error('SyncEngine: fullPull failed', err);
      this._setStatus('error');
    }
  }

  /**
   * Push ALL localStorage data to GitHub.
   * Called on manual "save all" or password change.
   */
  async fullPush() {
    if (!this.githubStorage) return;

    this._setStatus('syncing');
    try {
      const keys = await this.localCache.list();
      for (const key of keys) {
        const data = await this.localCache.read(key);
        if (data !== null) {
          await this.githubStorage.write(key, data);
        }
      }
      this._setStatus('idle');
    } catch (err) {
      console.error('SyncEngine: fullPush failed', err);
      this._setStatus('error');
    }
  }
}
