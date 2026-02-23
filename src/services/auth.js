/**
 * Auth service — PAT-based auth with encrypted repo backup.
 *
 * First-time: user pastes PAT + sets password → PAT encrypted in repo.
 * Returning (same device): PAT in localStorage → auto-load.
 * Returning (new device): fetch encrypted PAT from public repo → decrypt with password.
 * PAT revoked: user creates new PAT → re-encrypted with existing password.
 */

import { GitHubAPI } from './github-api.js';
import * as encryption from './encryption.js';

const TOKEN_KEY = 'arc_github_token';
const USER_KEY = 'arc_github_user';
const PASSWORD_KEY = 'arc_password';
const OWNER_KEY = 'arc_github_owner';
const REPO_KEY = 'arc_github_repo';

/**
 * First-time setup: validate PAT, encrypt it, store in repo.
 * Returns user info { login, avatar_url, name }.
 */
export async function setupAuth(pat, password, owner, repo) {
  // 1. Validate PAT
  const api = new GitHubAPI(pat, owner, repo);
  const user = await api.getUser();
  if (!user) throw new Error('Invalid token — could not authenticate');

  // 2. Verify repo access
  const repoInfo = await api.getRepo();
  if (!repoInfo) throw new Error(`Cannot access repo ${owner}/${repo}`);

  // 3. Generate password hash + salt
  const { hash: passwordHash, salt: passwordSalt } = await encryption.hashPassword(password);

  // 4. Encrypt PAT
  const encryptedPAT = await encryption.encrypt(pat, password, passwordSalt);

  // 5. Store auth.enc.json in repo
  await api.putFile('data/auth.enc.json', JSON.stringify({
    version: 1,
    encrypted_pat: encryptedPAT,
    updated_at: new Date().toISOString(),
  }, null, 2), null, 'arc: initial auth setup');

  // 6. Store profile.json (partially unencrypted)
  const profileSettings = {
    version: 1,
    created_at: new Date().toISOString(),
    settings: {
      theme: 'dark',
      notifications_enabled: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      week_start: 'monday',
    },
  };
  const encryptedSettings = await encryption.encrypt(
    JSON.stringify(profileSettings),
    password,
    passwordSalt,
  );

  await api.putFile('data/profile.json', JSON.stringify({
    password_hash: passwordHash,
    password_salt: passwordSalt,
    github_owner: owner,
    github_repo: repo,
    encrypted_data: encryptedSettings,
  }, null, 2), null, 'arc: initial profile');

  // 7. Initialize empty data files
  const emptyFiles = [
    { key: 'daily-log', data: { version: 1, days: {} } },
    { key: 'streaks', data: { version: 1, current_streak: 0, longest_streak: 0, streak_start_date: null, last_active_date: null, streak_history: [], bonuses_earned: [], rest_days: [] } },
    { key: 'achievements', data: { version: 1, unlocked: [], progress: {} } },
    { key: 'level', data: { version: 1, current_level: 1, current_level_name: 'Starting', weekly_xp_history: [], consecutive_weeks_at_target: 0, level_up_history: [], season: { number: 1, start_date: new Date().toISOString().split('T')[0], legacy_badges: [] } } },
    { key: 'reviews', data: { version: 1, reviews: [] } },
    { key: 'reading', data: { version: 1, books: [] } },
    { key: 'habits', data: { version: 1, habit_definitions: [], log: {} } },
  ];

  for (const { key, data } of emptyFiles) {
    const encrypted = await encryption.encrypt(JSON.stringify(data), password, passwordSalt);
    await api.putFile(`data/${key}.json`, encrypted, null, `arc: init ${key}`);
  }

  // 8. Cache in localStorage
  localStorage.setItem(TOKEN_KEY, pat);
  localStorage.setItem(PASSWORD_KEY, password);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(OWNER_KEY, owner);
  localStorage.setItem(REPO_KEY, repo);

  return { login: user.login, avatar_url: user.avatar_url, name: user.name };
}

/**
 * Recover auth on a new device.
 * Fetches encrypted PAT from public repo, decrypts with password.
 */
export async function recoverAuth(owner, repo, password) {
  // 1. Fetch profile.json (public, no auth needed)
  const profileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/data/profile.json`;
  const profileResp = await fetch(profileUrl);
  if (!profileResp.ok) throw new Error('Could not find profile — check username/repo');
  const profile = await profileResp.json();

  // 2. Verify password
  const valid = await encryption.verifyPassword(password, profile.password_hash, profile.password_salt);
  if (!valid) throw new Error('Incorrect password');

  // 3. Fetch auth.enc.json (public)
  const authUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/data/auth.enc.json`;
  const authResp = await fetch(authUrl);
  if (!authResp.ok) throw new Error('Could not find auth data');
  const authData = await authResp.json();

  // 4. Decrypt PAT
  const pat = await encryption.decrypt(authData.encrypted_pat, password, profile.password_salt);

  // 5. Validate recovered PAT
  const api = new GitHubAPI(pat, owner, repo);
  const user = await api.getUser();
  if (!user) throw new Error('Recovered token is expired or revoked — please create a new PAT');

  // 6. Cache in localStorage
  localStorage.setItem(TOKEN_KEY, pat);
  localStorage.setItem(PASSWORD_KEY, password);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(OWNER_KEY, owner);
  localStorage.setItem(REPO_KEY, repo);

  return { login: user.login, avatar_url: user.avatar_url, name: user.name };
}

/**
 * Get stored token from localStorage.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored password from localStorage.
 */
export function getPassword() {
  return localStorage.getItem(PASSWORD_KEY);
}

/**
 * Get stored user info.
 */
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Get stored owner/repo.
 */
export function getRepoInfo() {
  return {
    owner: localStorage.getItem(OWNER_KEY),
    repo: localStorage.getItem(REPO_KEY),
  };
}

/**
 * Check if user is authenticated (has token in localStorage).
 */
export function isAuthenticated() {
  return getToken() !== null;
}

/**
 * Logout — clear token and user from localStorage.
 * PAT remains encrypted in repo for recovery.
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PASSWORD_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(OWNER_KEY);
  localStorage.removeItem(REPO_KEY);
}
