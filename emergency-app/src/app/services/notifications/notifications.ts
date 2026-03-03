import { inject, Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { firstValueFrom } from 'rxjs';
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
      cognitoId,
      fcmToken,
      location: {
        type: "Point",
        coordinates: [userLongitude, userLatitude]
      }
    };
    try {
      const obs = await this.authService.makeAuthenticatedRequest(`/users/cognito/sync`, 'POST', payload);
      const result = await firstValueFrom(obs);
      console.log('[NotificationsService] Backend PUT result:', result);
      return result;
    } catch (error) {
      console.error('[NotificationsService] Error updating FCM token/location:', error);
      throw error;
    }
  }
}
