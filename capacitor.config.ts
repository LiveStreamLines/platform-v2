import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lslplatform.lsl',
  appName: 'LSL Client',
  webDir: 'dist/lslplatform/browser',
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile'
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      overlays: true
    }
  }
};

export default config;
