import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export async function ensurePermissions() {
  try {
    await LocalNotifications.requestPermissions();
    await PushNotifications.requestPermissions();
    await PushNotifications.register();
  } catch (e) { 
    console.log('perm fail', e); 
  }
}
