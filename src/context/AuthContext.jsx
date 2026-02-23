import { createContext, useContext, useState, useCallback } from 'react';
import * as encryption from '../services/encryption';

const AUTH_KEY = 'arc_authed';
const PASS_HASH_KEY = 'arc_pass_hash';
const PASS_SALT_KEY = 'arc_pass_salt';
const PASSWORD_KEY = 'arc_password';
const DEFAULT_PASSWORD = 'ArcAdmin123';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');
  const [password, setPasswordState] = useState(() => localStorage.getItem(PASSWORD_KEY) || null);

  /**
   * First-time setup: hash the default password and store.
   * Or verify entered password against stored hash.
   */
  const login = useCallback(async (enteredPassword) => {
    const storedHash = localStorage.getItem(PASS_HASH_KEY);

    if (!storedHash) {
      // First time — initialize with the entered password (or default)
      const pass = enteredPassword || DEFAULT_PASSWORD;
      const { hash, salt } = await encryption.hashPassword(pass);
      localStorage.setItem(PASS_HASH_KEY, hash);
      localStorage.setItem(PASS_SALT_KEY, salt);
      localStorage.setItem(PASSWORD_KEY, pass);
      localStorage.setItem(AUTH_KEY, 'true');
      setPasswordState(pass);
      setIsAuthed(true);
      return { success: true, firstTime: true };
    }

    // Returning — verify password
    const storedSalt = localStorage.getItem(PASS_SALT_KEY);
    const valid = await encryption.verifyPassword(enteredPassword, storedHash, storedSalt);
    if (!valid) {
      return { success: false, error: 'Incorrect password' };
    }

    localStorage.setItem(PASSWORD_KEY, enteredPassword);
    localStorage.setItem(AUTH_KEY, 'true');
    setPasswordState(enteredPassword);
    setIsAuthed(true);
    return { success: true, firstTime: false };
  }, []);

  /**
   * Change password: verify old, re-hash with new.
   */
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    const storedHash = localStorage.getItem(PASS_HASH_KEY);
    const storedSalt = localStorage.getItem(PASS_SALT_KEY);

    if (storedHash) {
      const valid = await encryption.verifyPassword(oldPassword, storedHash, storedSalt);
      if (!valid) return { success: false, error: 'Current password is incorrect' };
    }

    const { hash, salt } = await encryption.hashPassword(newPassword);
    localStorage.setItem(PASS_HASH_KEY, hash);
    localStorage.setItem(PASS_SALT_KEY, salt);
    localStorage.setItem(PASSWORD_KEY, newPassword);
    setPasswordState(newPassword);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(PASSWORD_KEY);
    setPasswordState(null);
    setIsAuthed(false);
  }, []);

  const getPassword = useCallback(() => {
    return password || localStorage.getItem(PASSWORD_KEY);
  }, [password]);

  const getSalt = useCallback(() => {
    return localStorage.getItem(PASS_SALT_KEY);
  }, []);

  const isFirstTime = !localStorage.getItem(PASS_HASH_KEY);

  return (
    <AuthContext.Provider value={{
      isAuthed, isFirstTime, password, login, logout, changePassword, getPassword, getSalt,
      defaultPassword: DEFAULT_PASSWORD,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
