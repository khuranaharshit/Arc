/**
 * Storage interface. All storage implementations must follow this contract.
 * Keys are logical names like "daily-log", "streaks", etc.
 */
export class IStorage {
  /** @returns {Promise<object|null>} */
  async read(_key) { throw new Error('Not implemented'); }

  /** @returns {Promise<void>} */
  async write(_key, _data) { throw new Error('Not implemented'); }

  /** @returns {Promise<void>} */
  async delete(_key) { throw new Error('Not implemented'); }

  /** @returns {Promise<string[]>} */
  async list() { throw new Error('Not implemented'); }

  /** @returns {Promise<boolean>} */
  async exists(_key) { throw new Error('Not implemented'); }
}
