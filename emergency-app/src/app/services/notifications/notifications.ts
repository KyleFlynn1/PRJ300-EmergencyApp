import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly apiUrls = [
    // To use backend with mobile device get the laptop or computer ip and replace localhost with that ip address
    `${environment.apiBaseUrl}/api/v1/users`, // primary
    `${environment.apiBaseUrl}/api/v1/users`, // fallback
  ];

  private apiUrl = this.apiUrls[0];
  private http = inject(HttpClient);
  private apiHeaders = { 'X-API-Key': 'blahblah' };

  constructor() {
    // If primary fails, switch to fallback
    this.http.get(this.apiUrls[0], { observe: 'response' }).subscribe({
      error: () => (this.apiUrl = this.apiUrls[1]),
    });
  }

  async saveTokenToDatabase(token: string, cognitoId: string, userLatitude: number, userLongitude: number) {
    const payload = { 
      cognitoId, 
      token,
      location: {
        type: "Point",
        coordinates: [userLongitude, userLatitude]
      }
    };
    console.log('[NotificationsService] Saving token to backend:', {
      apiUrl: this.apiUrl,
      cognitoId,
      token,
      userLatitude,
      userLongitude,
      payload
    });
    try {
      // Check if user exists
      const user: any = await this.http.get(
        `${this.apiUrl}/${cognitoId}`,
        { headers: this.apiHeaders }
      ).toPromise();
      console.log('[NotificationsService] User exists, updating token/location:', user);
      // If user exists, update token and location
      const patchResult = await this.http.patch(
        `${this.apiUrl}/${cognitoId}`,
        payload,
        { headers: this.apiHeaders }
      ).toPromise();
      console.log('[NotificationsService] Patch result:', patchResult);
      console.log('Token and location updated for existing user');
    } catch (error: any) {
      // If not found, create user with token and location
      if (error.status === 404) {
        console.log('[NotificationsService] User not found, creating new user...');
        const postResult = await this.http.post(
          `${this.apiUrl}`,
          payload,
          { headers: this.apiHeaders }
        ).toPromise();
        console.log('[NotificationsService] Post result:', postResult);
        console.log('User created with token and location');
      } else {
        console.error('[NotificationsService] Error checking/creating user:', error);
      }
    }
  }

}
