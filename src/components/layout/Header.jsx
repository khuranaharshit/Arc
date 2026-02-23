import { useState } from 'react';
import { Menu, Wifi, WifiOff, RefreshCw, Settings, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const syncStatus = 'idle'; // will be real later

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-md md:pl-60">
        {/* Mobile menu button */}
        <button
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo on mobile */}
        <div className="md:hidden">
          <span className="text-lg font-bold text-gradient">Arc</span>
        </div>

        {/* Spacer for desktop */}
        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Sync status */}
          <button
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
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

          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-slate-900 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="text-lg font-bold text-gradient">Arc</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200"
              >
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
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary-light'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`
                    }
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
