import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Emergency App',
  webDir: 'www',
  server: {
    cleartext: true,
    allowNavigation: ['*']
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
