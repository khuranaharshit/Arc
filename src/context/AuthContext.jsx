import { createContext, useContext, useState, useCallback } from 'react';
import * as auth from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getUser());
  const [isAuthed, setIsAuthed] = useState(() => auth.isAuthenticated());

  const login = useCallback((userData) => {
    setUser(userData);
    setIsAuthed(true);
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    setIsAuthed(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
