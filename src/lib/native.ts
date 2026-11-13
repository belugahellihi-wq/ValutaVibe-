import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
export const isNative = Capacitor.isNativePlatform();
export function haptic() { if (isNative) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}); }
export function initNative() {
  if (isNative) void SystemBars.setStyle({ style: SystemBarsStyle.Dark }).catch(() => {});
}
