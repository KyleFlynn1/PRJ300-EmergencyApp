import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PushService } from './services/push/push';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, RouterLink, RouterLinkActive],
})
export class AppComponent {
  constructor(private pushService: PushService) {
  this.pushService.init();
}
ngOnInit() {
  if (Capacitor.isNativePlatform()) {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', token => {
      console.log('📱 FCM TOKEN:', token.value);
      alert('FCM Token:\n' + token.value); // TEMP: easy copy
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('Registration error:', err);
    });
  }
}
}


