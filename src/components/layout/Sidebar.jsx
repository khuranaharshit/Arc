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
    <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 md:pt-14">
      <div className="flex flex-1 flex-col overflow-y-auto border-r px-3 py-4"
        style={{ background: 'rgba(10, 10, 15, 0.95)', borderColor: 'var(--color-border)' }}>
        <div className="mb-6 px-3">
          <h1 className="text-2xl font-extrabold text-gradient">Arc</h1>
          <p className="mt-0.5 text-[11px] font-medium text-white/25">Growth Tracker</p>
        </div>

        <nav className="flex-1 space-y-0.5">
          {mainItems.map((item) => {
            const Icon = Icons[item.icon];
            if (item.path === '/settings') return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-500/15 text-purple-400 shadow-sm'
                      : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                  }`
                }
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </NavLink>
            );
          })}

          <button
            onClick={() => setTrackingOpen(!trackingOpen)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-white/40 transition-all hover:bg-white/5 hover:text-white/70"
          >
            <span className="flex items-center gap-3">
              <Icons.Layers className="h-4 w-4" />
              Tracking
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${trackingOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {trackingOpen && (
            <div className="ml-4 space-y-0.5 border-l pl-3" style={{ borderColor: 'var(--color-border)' }}>
              {trackingItems.map((item) => {
                const Icon = Icons[item.icon];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-purple-500/15 text-purple-400'
                          : 'text-white/30 hover:bg-white/5 hover:text-white/60'
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

        <div className="mt-auto border-t pt-2" style={{ borderColor: 'var(--color-border)' }}>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-500/15 text-purple-400'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/70'
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
