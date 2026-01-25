import { Injectable } from '@angular/core';
import { Geolocation, Position, PermissionStatus, CallbackID, WatchPositionCallback } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  async getCurrentLocation(): Promise<Position | null> {
    try {
      // On web, just call getCurrentPosition (browser handles permission)
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
      return await Geolocation.getCurrentPosition();
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // Check location permission status 
  async checkLocationPermission(): Promise<boolean> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        // On web, permission is handled by browser prompt
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
