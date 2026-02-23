import { IStorage } from './IStorage.js';

/**
 * Development filesystem storage. Talks to the local dev-server.js
 * which reads/writes plain JSON files to ./data/ on disk.
 *
 * Data is stored UNENCRYPTED for easy inspection during development.
 * In production, GitHubStorage encrypts everything.
 *
 * Usage:
 *   1. Run: node dev-server.js
 *   2. Pass new DevStorage('http://localhost:3001') to SyncEngine
 */
export class DevStorage extends IStorage {
  constructor(baseUrl = 'http://localhost:3001') {
    super();
    this.baseUrl = baseUrl;
  }

  async _fetch(path, options = {}) {
    const resp = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!resp.ok && resp.status !== 404) {
      const body = await resp.text().catch(() => '');
      throw new Error(`DevStorage: ${resp.status} ${body}`);
    }
    return resp;
  }

  async read(key) {
    const resp = await this._fetch(`/api/data/${key}`);
    if (resp.status === 404) return null;
    const result = await resp.json();
    return result.data;
  }

  async write(key, data) {
    await this._fetch(`/api/data/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(key) {
    await this._fetch(`/api/data/${key}`, { method: 'DELETE' });
  }

  async list() {
    const resp = await this._fetch('/api/data');
    const result = await resp.json();
    return result.keys || [];
  }

  async exists(key) {
    const resp = await this._fetch(`/api/data/${key}`);
    return resp.status !== 404;
  }

  /**
   * Check if the dev server is running.
   */
  async isAvailable() {
    try {
      const resp = await fetch(`${this.baseUrl}/api/health`);
      return resp.ok;
    } catch {
      return false;
    }
  }
}
