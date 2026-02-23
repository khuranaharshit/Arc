import { useState, useEffect, useCallback } from 'react';

/**
 * PWA notification hook.
 * Requests permission, sends browser notifications for streak risk / daily nudge.
 */
export function useNotifications() {
  const [permission, setPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [supported] = useState(() => 'Notification' in window && 'serviceWorker' in navigator);

  const requestPermission = useCallback(async () => {
    if (!supported) return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [supported]);

  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') return;
    try {
      new Notification(title, {
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        ...options,
      });
    } catch {
      // iOS PWA may not support Notification constructor, try service worker
      navigator.serviceWorker?.ready?.then((reg) => {
        reg.showNotification(title, {
          icon: '/icons/icon-192.png',
          ...options,
        });
      });
    }
  }, [permission]);

  /**
   * Check if user should be nudged (no XP logged today + past morning time).
   */
  const checkDailyNudge = useCallback((todayXP, morningHour = 8) => {
    if (todayXP > 0) return;
    const now = new Date();
    if (now.getHours() >= morningHour) {
      sendNotification('Time to earn some XP!', {
        body: "You haven't logged any activities today. Keep your streak alive!",
        tag: 'daily-nudge',
      });
    }
  }, [sendNotification]);

  /**
   * Check if streak is at risk (no XP yesterday + no XP today).
   */
  const checkStreakRisk = useCallback((streakAlive, todayXP) => {
    if (!streakAlive && todayXP === 0) {
      sendNotification('Your streak is at risk!', {
        body: 'Log at least 10 XP today to keep it going.',
        tag: 'streak-risk',
      });
    }
  }, [sendNotification]);

  return { supported, permission, requestPermission, sendNotification, checkDailyNudge, checkStreakRisk };
}
