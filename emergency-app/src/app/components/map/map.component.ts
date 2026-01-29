import { Component, AfterViewInit, OnInit } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { IonicModule } from "@ionic/angular";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';
import { Alert } from 'src/app/services/alerts/alert';
import { Report } from 'src/app/interfaces/report.interface';

@Component({
  selector: 'app-map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [IonicModule],
})

export class MapComponent  implements OnInit, AfterViewInit {
  map!: Map;

  // User location, set from geolocation service
  userLat?: number;
  userLng?: number;

  //List of pins to show on map got from the alerts service with api
  pins: { lon: number; lat: number; title: string }[] = [];

  constructor(private alertService: Alert, private geolocationService: GeolocationService) {}

  async ngOnInit() {
    // Fetch alerts
    this.alertService.getAlerts().subscribe(alerts => {
      // Convert alerts to pins
      this.pins = alerts
        .filter(alert => alert.location?.lng && alert.location?.lat)
        .map(alert => ({
          lon: alert.location.lng!,
          lat: alert.location.lat!,
          title: alert.category || 'Alert'
        }));
      
      // Reinitialize map if already created to update pins
      if (this.map) {
        this.updateMapMarkers();
      }
    });
  }
  
  // Get and set user location, with user-friendly error handling
  private async getAndSetUserLocation(): Promise<boolean> {
    try {
      const position = await this.geolocationService.getCurrentLocation();
      if (position) {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        console.log('User location:', this.userLat, this.userLng);
        return true;
      } else {
        this.userLat = undefined;
        this.userLng = undefined;
        return false;
      }
    } catch (error) {
      this.userLat = undefined;
      this.userLng = undefined;
      return false;
    }
  }

  // Make sure map is initialized after view is ready to avoid errors or map not showing
  async ngAfterViewInit() {
    // Initialize map immediately for faster loading
    setTimeout(() => this.initMap(), 100);
    
    // Get user location in parallel (don't wait for it)
    this.getAndSetUserLocation().then(success => {
      if (success && this.map) {
        // Update map with user location marker after it's retrieved
        this.updateMapMarkers();
        // Re-center map on user location
        if (this.userLat && this.userLng) {
          this.map.getView().setCenter(fromLonLat([this.userLng, this.userLat]));
        }
      }
    });
  }
  
  // Update map markers without recreating the entire map
  private updateMapMarkers() {
    // Remove old marker layer
    const layers = this.map.getLayers();
    layers.forEach(layer => {
      if (layer instanceof VectorLayer) {
        this.map.removeLayer(layer);
      }
    });
    
    // Recreate features with updated pins
    const features = this.pins.map(pin => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([pin.lon, pin.lat]))
      });
      feature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'assets/marker.png',
            scale: 0.1
          })
        })
      );
      return feature;
    });

    // Add user location marker if available
    if (this.userLat !== undefined && this.userLng !== undefined) {
      const userMarker = new Feature({
        geometry: new Point(fromLonLat([this.userLng, this.userLat]))
      });
      userMarker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'assets/userMarker.png',
            scale: 0.09
          })
        })
      );
      features.push(userMarker);
    }

    // Add new marker layer
    const markerLayer = new VectorLayer({
      source: new VectorSource({ features })
    });
    this.map.addLayer(markerLayer);
  }

  // Initialize the map with OpenLayers
  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error("map not found, likely internet related on error in code");
      return;
    }
    const tileLayer = new TileLayer({source: new OSM()});
    const features = this.pins.map(pin => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([pin.lon, pin.lat])),
        //name: pin.title //hoping to use this to make it hoverable
      });
      //below style declared there so that anchor can be used
      feature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'assets/marker.png',
            scale: 0.1
          })
        })
      );
      return feature;
    });

    // Add user location marker if available
    if (this.userLat !== undefined && this.userLng !== undefined) {
      const userMarker = new Feature({
        geometry: new Point(fromLonLat([this.userLng, this.userLat]))
      });
      userMarker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'assets/userMarker.png',
            scale: 0.09
          })
        })
      );
      features.push(userMarker);
    }

    //below adds a layer onto of the map for markers (stored in features)
    const markerLayer = new VectorLayer({
      source: new VectorSource({ features })
    });

    // Center map on user location if available, else default to Ireland
    const center = (this.userLat !== undefined && this.userLng !== undefined)
      ? fromLonLat([this.userLng, this.userLat])
      : fromLonLat([-8.473997, 54.272470]);

    this.map = new Map({
      target: mapElement,
      layers: [tileLayer, markerLayer],
      view: new View({
        center,
        zoom: 13
      })
    });
  }
}