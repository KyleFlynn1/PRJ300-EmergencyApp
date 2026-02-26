import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonIcon, IonContent } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { NotificationsService } from 'src/app/services/notifications/notifications';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, IonIcon, RouterLink, RouterLinkActive, IonContent],
})
export class AppComponent implements OnInit {

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {
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
      this.saveTokenToDatabase(token.value);
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

  async getCognitoId(): Promise<string | null> {
    try {
      const user = await this.authService['currentUserSubject']?.getValue?.();
      if (user && user.username) {
        return user.username;
      }
      // If not in BehaviorSubject, fetch from AuthService
      const currentUser = await this.authService.getCurrentUser();
      return currentUser?.username || null;
    } catch (error) {
      console.error('Error getting Cognito ID:', error);
      return null;
    }
  }

  async getCurrentLocation() {
    const position = await Geolocation.getCurrentPosition();
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  }

  // Save token to database for notifications
  async saveTokenToDatabase(token: string) {
    console.log('Saving token to database:', token);
    const { value: savedToken } = await Preferences.get({ key: 'fcm_token' });
    if (savedToken === token) {
      // If the token is already saved, no need to save again
      return;
    }
    try {
      const cognitoId = await this.getCognitoId();
      if (!cognitoId) {
        throw new Error('Cognito ID not found. User may not be authenticated.');
      }
      const location = await this.getCurrentLocation();
      await this.notificationsService.saveTokenToDatabase(
        token,
        cognitoId,
        location?.lat || 0,
        location?.lng || 0
      );
      await Preferences.set({ key: 'fcm_token', value: token });
      console.log('Token saved successfully!');
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }
}
