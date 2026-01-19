import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class PushService {

  init() {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', token => {
      console.log('FCM Token:', token.value);
      // 🔴 Send this token to your backend
    });

    PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Notification received', notification);
    });

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      notification => {
        console.log('Notification tapped', notification);
      }
    );
  }
}
