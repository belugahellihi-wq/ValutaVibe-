import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { isNative } from '../lib/native';
export function useConnection(refresh: () => void) {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('online', on); window.addEventListener('offline', off); document.addEventListener('visibilitychange', visible);
    let disposed = false;
    const network = isNative ? Network.addListener('networkStatusChange', s => { if (!disposed) setOnline(s.connected); }) : null;
    const resume = isNative ? App.addListener('appStateChange', s => { if (s.isActive && !disposed) refresh(); }) : null;
    if (isNative) void Network.getStatus().then(s => { if (!disposed) setOnline(s.connected); }).catch(() => {});
    return () => {
      disposed = true; window.removeEventListener('online', on); window.removeEventListener('offline', off); document.removeEventListener('visibilitychange', visible);
      void network?.then(h => h.remove()); void resume?.then(h => h.remove());
    };
  }, [refresh]);
  return online;
}
