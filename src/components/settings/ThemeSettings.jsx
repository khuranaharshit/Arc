import { useState, useEffect } from 'react';
import { Palette, Lock, Check } from 'lucide-react';
import { Card, CardHeader } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const THEMES = [
  { key: 'dark', name: 'Midnight', colors: ['#0a0a0f', '#a855f7', '#ec4899'], unlockReq: null },
  { key: 'light', name: 'Daylight', colors: ['#f5f3ff', '#9333ea', '#db2777'], unlockReq: null },
  { key: 'ocean', name: 'Deep Ocean', colors: ['#0a0f1a', '#3b82f6', '#06b6d4'], unlockReq: 'first_blood' },
  { key: 'emerald', name: 'Emerald', colors: ['#0a0f0a', '#10b981', '#34d399'], unlockReq: 'iron_mind' },
  { key: 'sunset', name: 'Sunset', colors: ['#1a0a0a', '#f97316', '#ef4444'], unlockReq: 'logic_i' },
  { key: 'rose', name: 'Rose Gold', colors: ['#1a0a10', '#ec4899', '#f43f5e'], unlockReq: 'writer_i' },
  { key: 'cyber', name: 'Cyberpunk', colors: ['#0f0a1a', '#8b5cf6', '#06ffc7'], unlockReq: 'builder' },
  { key: 'gold', name: 'Gold', colors: ['#1a150a', '#f59e0b', '#eab308'], unlockReq: 'diamond_mind' },
];

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { achievementDAO } = useData();
  const { addToast } = useToast();
  const [unlocked, setUnlocked] = useState(new Set());

  useEffect(() => {
    achievementDAO.getUnlocked().then((list) => {
      setUnlocked(new Set(list.map((a) => a.key)));
    });
  }, [achievementDAO]);

  const handleSelect = (t) => {
    if (t.unlockReq && !unlocked.has(t.unlockReq)) {
      addToast(`Unlock "${t.name}" by earning the achievement first`, 'info');
      return;
    }
    setTheme(t.key);
    addToast(`Theme: ${t.name}`, 'success');
  };

  // For now, dark/light are the functional themes. Others set a CSS variable accent.
  const currentBase = theme === 'light' ? 'light' : 'dark';

  return (
    <Card>
      <CardHeader title="Themes" icon={Palette} subtitle="Unlock with achievements" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {THEMES.map((t) => {
          const isLocked = t.unlockReq && !unlocked.has(t.unlockReq);
          const isActive = theme === t.key || (t.key === 'dark' && currentBase === 'dark' && theme === 'dark') || (t.key === 'light' && theme === 'light');

          return (
            <button key={t.key} onClick={() => handleSelect(t)}
              className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all active:scale-[0.97] ${
                isActive ? 'ring-2 ring-purple-500/50' : ''
              } ${isLocked ? 'opacity-40' : 'hover:scale-[1.03]'}`}
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-row)' }}>
              {/* Color preview */}
              <div className="flex gap-1">
                {t.colors.map((c, i) => (
                  <div key={i} className="h-6 w-6 rounded-full border border-white/10" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs font-medium t-secondary">{t.name}</span>
              {isLocked && <Lock className="absolute top-2 right-2 h-3.5 w-3.5 t-faint" />}
              {isActive && <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-purple-400" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
