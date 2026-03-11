import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taakadapp.app',
  appName: 'تأكد',
  webDir: 'dist',
  server: {
    url: 'https://www-taakadapp-com.lovable.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    minWebViewVersion: '95.0',
  },
};

export default config;
