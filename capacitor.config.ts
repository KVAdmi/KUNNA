import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kunna.app',
  appName: 'KUNNA',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#E63946"
    },
    Geolocation: {
      requireAlwaysAuthorization: true,
      backgroundLocationPermissionTitle: "Permitir ubicación en segundo plano",
      backgroundLocationPermissionText: "KUNNA necesita tu ubicación para mantenerte segura incluso cuando la app está cerrada"
    }
  }
};

export default config;
