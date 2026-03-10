import { Injectable } from '@angular/core';
import { Geolocation, Position, PermissionStatus, CallbackID, WatchPositionCallback } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  // Nominatim API base URL for geocoding and reverse geocoding
  private readonly url = "https://nominatim.openstreetmap.org";

  constructor(private http: HttpClient) {}

  // Geocode address to lat/lng using Nominatim — returns first result only
  async geocodeAddress(address: string): Promise<{ lat: number, lng: number, address: string } | null> {
    const results = await this.searchAddressSuggestions(address, 1);
    return results.length > 0 ? results[0] : null;
  }

  // Search address and return up to `limit` suggestions returns array based on popularity
  async searchAddressSuggestions(query: string, limit = 5): Promise<{ lat: number, lng: number, address: string }[]> {
    try {
      const url = `${this.url}/search?format=json&limit=${limit}&q=${encodeURIComponent(query)}`;
      let response: any;
      if (Capacitor.getPlatform() !== 'web') {
        const res = await CapacitorHttp.get({ url, headers: { 'User-Agent': 'PRJ300EmergencyApp/1.0' } });
        response = res.data;
      } else {
        response = await firstValueFrom(
          this.http.get(url, { headers: new HttpHeaders({ 'User-Agent': 'PRJ300EmergencyApp/1.0' }) })
        );
      }
      if (!Array.isArray(response)) return [];
      return response.map((r: any) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        address: r.display_name
      }));
    } catch {
      return [];
    }
  }

  // Get a string address from the lat nad lng using api
  async reverseGeoloc(lat: number, lng: number): Promise<string> {
    try {
      const url = `${this.url}/reverse?format=json&lat=${lat}&lon=${lng}`;
      
      // Use Capacitor HTTP on native platforms to bypass CORS
      if (Capacitor.getPlatform() !== 'web') {
        const response = await CapacitorHttp.get({
          url: url,
          headers: {
            'User-Agent': 'PRJ300EmergencyApp/1.0'
          }
        });
        
        const data = response.data;
        if (!data || !data.address) {
          return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        
        const addr = data.address;
        const parts: string[] = [];
        
        if (addr.locality) parts.push(addr.locality);
        if (addr.region) parts.push(addr.region);
        if (addr.postcode) parts.push(addr.postcode);
        if (addr.county) parts.push(addr.county);
        
        // put together the different fields/parts got from the api into a single address string
        return parts.length > 0 ? parts.join(', ') : data.display_name;
      } else {

        // Use Angular HTTP on web
        const headers = new HttpHeaders({
          'User-Agent': 'PRJ300EmergencyApp/1.0'
        });
        
        const params = {
          format: 'json',
          lat: lat.toString(),
          lon: lng.toString()
        };
        
        const response: any = await firstValueFrom(
          this.http.get(this.url + '/reverse', { headers, params })
        );
        
        if (!response || !response.address) {
          return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        
        const addr = response.address;
        const parts: string[] = [];
        
        if (addr.locality) parts.push(addr.locality);
        if (addr.region) parts.push(addr.region);
        if (addr.postcode) parts.push(addr.postcode);
        if (addr.county) parts.push(addr.county);
        
        return parts.length > 0 ? parts.join(', ') : response.display_name;
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  // Using capacitor geolocation plugin to get the current position of the user with permission handling and error handling for both web and native platforms
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
        enableHighAccuracy: false, // Use network location for speed
        timeout: 5000, // 5 seconds max
        maximumAge: 300000 // Accept cached location up to 5 minutes old
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
