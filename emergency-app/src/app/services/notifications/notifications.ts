import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { timeout } from 'rxjs';
import { fetchAuthSession } from '@aws-amplify/auth';
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private authService = inject(AuthService);

  constructor() {
  }

  async saveTokenToDatabase(fcmToken: string, cognitoId: string, userLatitude: number, userLongitude: number) {
    // Use AuthService's authenticated method and await the Observable
    const payload = {
      fcmToken,
      location: {
        type: "Point",
        coordinates: [userLongitude, userLatitude]
      }
    };
    try {
      const obs = await this.authService.makeAuthenticatedRequest(`/users/cognito/me`, 'PUT', payload);
      const result = await obs.toPromise();
      console.log('[NotificationsService] Backend PUT result:', result);
      return result;
    } catch (error) {
      console.error('[NotificationsService] Error updating FCM token/location:', error);
      throw error;
    }
  }
}
