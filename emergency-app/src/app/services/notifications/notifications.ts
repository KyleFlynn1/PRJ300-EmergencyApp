import { inject, Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})


// Notification service saves the Firebase Cloud Messaging token for that device to the user in the database
export class NotificationsService {
  private authService = inject(AuthService);


  // Saving the token to backend and the current uptodate location
  async saveTokenToDatabase(fcmToken: string, cognitoId: string, userLatitude: number, userLongitude: number) {
    // Use AuthService's authenticated method and await the Observable
    const payload = {
      fcmToken,
      // Save as mongoDb location data type so mongodb locatoin filtering works in backend
      location: {
        type: "Point",
        coordinates: [userLongitude, userLatitude]
      }
    };
    try {
      const obs = await this.authService.makeAuthenticatedRequest(`/users/cognito/me`, 'PUT', payload);
      const result = await obs.toPromise();
      //console.log('[NotificationsService] Backend PUT result:', result);
      return result;
    } catch (error) {
      //console.error('[NotificationsService] Error updating FCM token/location:', error);
      throw error;
    }
  }
}
