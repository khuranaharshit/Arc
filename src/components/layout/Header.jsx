import { useState } from 'react';
import { Menu, Wifi, WifiOff, RefreshCw, Settings, X, Sun, Moon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const syncStatus = 'idle';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b px-4 backdrop-blur-xl md:pl-60"
        style={{ background: 'var(--header-bg)', borderColor: 'var(--color-border)' }}>
        <button
          className="rounded-xl p-2 t-muted hover:t-secondary md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="md:hidden">
          <span className="text-lg font-bold text-gradient">Arc</span>
        </div>

        <div className="hidden md:block" />

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 t-muted transition-colors hover:t-secondary"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
              syncStatus === 'idle'
                ? 'text-emerald-400 hover:bg-emerald-500/10'
                : syncStatus === 'syncing'
                  ? 'text-amber-400 hover:bg-amber-500/10'
                  : 'text-red-400 hover:bg-red-500/10'
            }`}
          >
            {syncStatus === 'idle' ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : syncStatus === 'syncing' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {syncStatus === 'idle' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
            </span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="rounded-xl p-2 t-muted transition-colors hover:t-secondary"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl animate-slide-up"
            style={{ background: 'var(--color-surface-solid)' }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-lg font-bold text-gradient">Arc</span>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded-xl p-1.5 t-muted hover:t-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = Icons[item.icon];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive ? 'bg-purple-500/15 text-purple-400' : 't-tertiary hover:t-secondary'
                      }`
                    }
                    style={({ isActive }) => !isActive ? { background: 'transparent' } : {}}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
