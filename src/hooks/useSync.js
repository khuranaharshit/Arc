import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

/**
 * Sync hook — exposes sync status and manual sync triggers.
 */
export function useSync() {
  const { syncEngine } = useData();
  const [status, setStatus] = useState(syncEngine?.getStatus() || 'idle');

  useEffect(() => {
    if (!syncEngine) return;
    return syncEngine.onStatusChange(setStatus);
  }, [syncEngine]);

  const manualSync = async () => {
    if (!syncEngine) return;
    await syncEngine.retryFailed();
  };

  const fullPush = async () => {
    if (!syncEngine) return;
    await syncEngine.fullPush();
  };

  const fullPull = async () => {
    if (!syncEngine) return;
    await syncEngine.fullPull();
  };

  return { status, manualSync, fullPush, fullPull };
}
