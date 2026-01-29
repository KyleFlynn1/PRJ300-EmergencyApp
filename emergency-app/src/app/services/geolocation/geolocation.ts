import { Injectable } from '@angular/core';
import { Geolocation, Position, PermissionStatus, CallbackID, WatchPositionCallback } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {

  private readonly url = "https://nominatim.openstreetmap.org/reverse";

  constructor(private http: HttpClient) {}

  async reverseGeoloc(lat: number, lng: number): Promise<string> {
    const headers = new HttpHeaders({
        'User-Agent': 'PRJ300EmergencyApp/1.0'
      });

      const params = {
        format: 'json',
        lat: lat.toString(),
        lon: lng.toString()
      };

      const response: any = await firstValueFrom(
        this.http.get(this.url, { headers, params })
      );

      if (!response || !response.address) {
        return 'Address not found';
      }

      // Extract key address components in specified order
      const addr = response.address;
      const parts: string[] = [];

      if (addr.locality) {
        parts.push(addr.locality);
      }

      if (addr.region) {
        parts.push(addr.region);
      }

      if (addr.postcode) {
        parts.push(addr.postcode);
      }

      if (addr.county) {
        parts.push(addr.county);
      }

      const finalAddress = parts.length > 0 ? parts.join(', ') : response.display_name;

      return finalAddress;
    }

  async getCurrentLocation(): Promise<Position | null> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        return await Geolocation.getCurrentPosition();
      }
      // On native, check/request permissions
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        await Geolocation.requestPermissions();
        const updatedPermissions = await Geolocation.checkPermissions();
        if (updatedPermissions.location !== 'granted') {
          return null;
        }
      }
      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      });
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // Check location permission status 
  async checkLocationPermission(): Promise<boolean> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        //permission is handled by browser prompt
        return true;
      }
      const permStatus: PermissionStatus = await Geolocation.checkPermissions();
      if (permStatus.location === 'granted') {
        return true;
      }
      const reqStatus: PermissionStatus = await Geolocation.requestPermissions();
      return reqStatus.location === 'granted';
    } catch (error) {
      console.error('Error checking/requesting location permission:', error);
      return false;
    }
  }

  // Watch the position for changes
  async watchPosition(callback: WatchPositionCallback): Promise<CallbackID> {
    return await Geolocation.watchPosition({}, callback);
  }

  // Stop watching position
  clearWatch(watchId: CallbackID) {
    Geolocation.clearWatch({ id: watchId });
  }
}
