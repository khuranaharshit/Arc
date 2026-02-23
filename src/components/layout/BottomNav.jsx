import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { BOTTOM_NAV_ITEMS } from '../../utils/constants';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t backdrop-blur-xl md:hidden safe-bottom"
      style={{ background: 'rgba(10, 10, 15, 0.9)', borderColor: 'var(--color-border)' }}>
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = Icons[item.icon];
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-all ${
                isActive ? 'text-purple-400' : 'text-white/30'
              }`
            }
          >
            {Icon && <Icon className="h-5 w-5" />}
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
