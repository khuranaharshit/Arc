import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Achievement unlock pop-up animation.
 * Renders as an overlay when triggered.
 */
export function AchievementToast({ achievement, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    // Auto-close after 4s
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none transition-all duration-500 ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`pointer-events-auto rounded-3xl border border-purple-500/30 px-8 py-6 shadow-2xl backdrop-blur-xl text-center transition-all duration-500 ${
        visible ? 'scale-100 translate-y-0' : 'scale-75 translate-y-8'
      }`} style={{ background: 'rgba(10, 10, 15, 0.95)' }} onClick={onClose}>
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 mb-3 animate-xp-pop">
          <Trophy className="h-8 w-8 text-purple-400" />
        </div>
        <p className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-1">Achievement Unlocked</p>
        <h3 className="text-xl font-extrabold t-primary">{achievement.name}</h3>
        <p className="mt-1 text-sm t-muted">{achievement.description}</p>
        <p className="mt-2 text-xs font-bold text-purple-400">+10 XP</p>
      </div>
    </div>
  );
}
