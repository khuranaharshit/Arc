import { IStorage } from './IStorage.js';

/**
 * GitHub-backed storage. Reads/writes encrypted JSON to a GitHub repo.
 * All data is encrypted before writing and decrypted after reading.
 */
export class GitHubStorage extends IStorage {
  /**
   * @param {import('../services/github-api').GitHubAPI} githubApi
   * @param {object} encryption — the encryption service module
   * @param {string} password
   * @param {string} salt — base64-encoded PBKDF2 salt
   */
  constructor(githubApi, encryption, password, salt) {
    super();
    this.githubApi = githubApi;
    this.encryption = encryption;
    this.password = password;
    this.salt = salt;
    this.shaCache = {}; // key → sha, for conflict-free updates
  }

  async read(key) {
    const result = await this.githubApi.getFile(`data/${key}.json`);
    if (!result) return null;
    this.shaCache[key] = result.sha;
    try {
      const decrypted = await this.encryption.decrypt(result.content, this.password, this.salt);
      return JSON.parse(decrypted);
    } catch (err) {
      console.error(`GitHubStorage: failed to decrypt ${key}`, err);
      return null;
    }
  }

  async write(key, data) {
    const plaintext = JSON.stringify(data, null, 2);
    const encrypted = await this.encryption.encrypt(plaintext, this.password, this.salt);
    const result = await this.githubApi.putFile(
      `data/${key}.json`,
      encrypted,
      this.shaCache[key] || null,
      `arc: update ${key}`,
    );
    this.shaCache[key] = result.sha;
  }

  async delete(key) {
    if (this.shaCache[key]) {
      await this.githubApi.deleteFile(`data/${key}.json`, this.shaCache[key], `arc: delete ${key}`);
      delete this.shaCache[key];
    }
  }

  async list() {
    const files = await this.githubApi.listFiles('data/');
    return files
      .filter((f) => f.name.endsWith('.json'))
      .map((f) => f.name.replace('.json', ''));
  }

  async exists(key) {
    const result = await this.githubApi.getFile(`data/${key}.json`);
    return result !== null;
  }

  /**
   * Read profile.json — special case since password_hash and password_salt
   * are stored unencrypted, while the rest is encrypted.
   */
  async readProfile() {
    const result = await this.githubApi.getFile('data/profile.json');
    if (!result) return null;
    this.shaCache['profile'] = result.sha;
    try {
      const parsed = JSON.parse(result.content);
      // The unencrypted fields
      const profile = {
        password_hash: parsed.password_hash,
        password_salt: parsed.password_salt,
        github_owner: parsed.github_owner,
        github_repo: parsed.github_repo,
      };
      // Decrypt the rest if present
      if (parsed.encrypted_data) {
        const decrypted = await this.encryption.decrypt(parsed.encrypted_data, this.password, this.salt);
        Object.assign(profile, JSON.parse(decrypted));
      }
      return profile;
    } catch (err) {
      console.error('GitHubStorage: failed to read profile', err);
      return null;
    }
  }

  /**
   * Write profile.json — password_hash and password_salt are unencrypted,
   * everything else is encrypted.
   */
  async writeProfile(profile) {
    const { password_hash, password_salt, github_owner, github_repo, ...rest } = profile;
    const encrypted_data = await this.encryption.encrypt(
      JSON.stringify(rest),
      this.password,
      this.salt,
    );
    const content = JSON.stringify({
      password_hash,
      password_salt,
      github_owner,
      github_repo,
      encrypted_data,
    }, null, 2);

    const result = await this.githubApi.putFile(
      'data/profile.json',
      content,
      this.shaCache['profile'] || null,
      'arc: update profile',
    );
    this.shaCache['profile'] = result.sha;
  }
}
