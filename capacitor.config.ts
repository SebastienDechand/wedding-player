import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sebastien.bloved',
  appName: 'B-Loved',
  webDir: 'dist/b-loved/browser',
  android: {
    backgroundColor: '#0a0a0a',
  },
  plugins: {
    // Pas de plugins natifs pour l'instant
  },
};

export default config;
