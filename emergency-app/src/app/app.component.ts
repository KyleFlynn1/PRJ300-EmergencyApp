import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonIcon, IonContent } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, IonIcon, RouterLink, RouterLinkActive, IonContent],
})
export class AppComponent {

  ngOnInit() {
    if (Capacitor.getPlatform() !== 'web') {
      this.initPush();
    }
  }
  async initPush() {
    //Request permission (Android auto-grants permisionsa but shows prompt on iOS)
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;

    //Register with FCM
    await PushNotifications.register();

    // 3. Get the FCM token (send this to your backend)
    PushNotifications.addListener('registration', (token) => {
      console.log('FCM Token:', token.value);
      // Add backened to send token to save 
    });

    //Handle errors
    PushNotifications.addListener('registrationError', (err) => {
      console.error('Registration error:', err);
    });

    //Notification received while app is open
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
    });

    // User tapped a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Notification tapped:', action);
    });
  }

  constructor() {
    // Load saved theme preference, default to light if not set
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === null || savedTheme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }
}
