import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Sidebar() {
  const [trackingOpen, setTrackingOpen] = useState(false);

  const mainItems = NAV_ITEMS.filter((item) => !item.group);
  const trackingItems = NAV_ITEMS.filter((item) => item.group === 'Tracking');

  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 md:pt-16">
      <div className="flex flex-1 flex-col overflow-y-auto border-r border-slate-800 bg-slate-900 px-3 py-4">
        <div className="mb-4 px-3">
          <h1 className="text-2xl font-bold text-gradient">Arc</h1>
          <p className="mt-0.5 text-xs text-slate-500">Growth Tracker</p>
        </div>

        <nav className="flex-1 space-y-0.5">
          {mainItems.map((item) => {
            const Icon = Icons[item.icon];
            if (item.path === '/settings') return null; // render at bottom
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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

          {/* Tracking group */}
          <button
            onClick={() => setTrackingOpen(!trackingOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <span className="flex items-center gap-3">
              <Icons.Layers className="h-4 w-4" />
              Tracking
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${trackingOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {trackingOpen && (
            <div className="ml-4 space-y-0.5 border-l border-slate-800 pl-3">
              {trackingItems.map((item) => {
                const Icon = Icons[item.icon];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary-light'
                          : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                      }`
                    }
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          )}
        </nav>

        {/* Settings at bottom */}
        <div className="mt-auto border-t border-slate-800 pt-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary-light'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <Icons.Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
