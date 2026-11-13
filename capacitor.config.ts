import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.valutavibe.app',
  appName: 'ValutaVibe',
  webDir: 'dist',
  backgroundColor: '#050708',
  loggingBehavior: 'debug',
  android: { allowMixedContent: false, minWebViewVersion: 111 },
  plugins: {
    SystemBars: { style: 'DARK', insetsHandling: 'native', initialViewportFitValueHint: 'cover' },
    SplashScreen: { launchAutoHide: true, launchShowDuration: 350, backgroundColor: '#050708', showSpinner: false },
  },
};
export default config;
