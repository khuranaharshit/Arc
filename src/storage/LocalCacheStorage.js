import { IStorage } from './IStorage.js';

const DATA_PREFIX = 'arc_data_';
const META_PREFIX = 'arc_meta_';

/**
 * localStorage-backed storage. Stores decrypted JSON for fast reads.
 */
export class LocalCacheStorage extends IStorage {
  async read(key) {
    const value = localStorage.getItem(DATA_PREFIX + key);
    return value ? JSON.parse(value) : null;
  }

  async write(key, data) {
    localStorage.setItem(DATA_PREFIX + key, JSON.stringify(data));
    localStorage.setItem(META_PREFIX + key, JSON.stringify({ updated_at: new Date().toISOString() }));
  }

  async delete(key) {
    localStorage.removeItem(DATA_PREFIX + key);
    localStorage.removeItem(META_PREFIX + key);
  }

  async list() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(DATA_PREFIX)) {
        keys.push(k.slice(DATA_PREFIX.length));
      }
    }
    return keys;
  }

  async exists(key) {
    return localStorage.getItem(DATA_PREFIX + key) !== null;
  }

  getMetadata(key) {
    const meta = localStorage.getItem(META_PREFIX + key);
    return meta ? JSON.parse(meta) : null;
  }

  /** Clear all arc data from localStorage */
  clearAll() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(DATA_PREFIX) || k.startsWith(META_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}
