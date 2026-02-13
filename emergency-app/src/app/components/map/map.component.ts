import { Component, AfterViewInit, OnInit, Output, EventEmitter } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { IonicModule, ModalController } from "@ionic/angular";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';
import { Alert } from 'src/app/services/alerts/alert';
import { Report } from 'src/app/interfaces/report.interface';
import { ReportModalComponent } from '../report-modal/report-modal.component';

@Component({
  selector: 'app-map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [IonicModule],
})

export class MapComponent  implements OnInit, AfterViewInit {
  map!: Map;

  // Emit selected alert to parent (no window events needed)
  @Output() alertSelected = new EventEmitter<any>();
  @Output() reportLocation = new EventEmitter<{ lat: number; lng: number; address: string }>();

  // User location, set from geolocation service
  userLat?: number;
  userLng?: number;

  //List of pins to show on map got from the alerts service with api
  pins: { lon: number; lat: number; title: string; alert: any }[] = [];

  // Pin dropped by user (for reporting)
  droppedPin?: { lon: number; lat: number; address?: string };

  constructor(
    private alertService: Alert,
    private geolocationService: GeolocationService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    // Fetch alerts
    this.alertService.getAlerts().subscribe(alerts => {
      // Convert alerts to pins
      this.pins = alerts
        .filter(alert => alert.location?.lng && alert.location?.lat)
        .map(alert => ({
          lon: alert.location.lng!,
          lat: alert.location.lat!,
          title: alert.category || 'Alert',
          alert: alert
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
    // Get user location first, then initialize map
    await this.getAndSetUserLocation();
    setTimeout(() => this.initMap(), 100);
    
    // Listen for map refresh events
    window.addEventListener('refreshMapPins', (e: any) => {
      console.log('refreshMapPins event received with', e.detail.alerts?.length, 'alerts');
      if (e.detail.alerts && e.detail.alerts.length > 0) {
        this.pins = e.detail.alerts
          .filter((alert: any) => alert.location?.lng && alert.location?.lat)
          .map((alert: any) => ({
            lon: alert.location.lng!,
            lat: alert.location.lat!,
            title: alert.category || 'Alert',
            alert: alert
          }));
        console.log('Updated pins to', this.pins.length);
        this.updateMapMarkers();
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
      // Store alert data on the feature so tap detection can retrieve it
      feature.set('alertData', pin.alert);
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
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([this.userLng || 0, this.userLat || 0]),
        zoom: 13,
      }),
    });

    // Single tap — use OL's built-in hit detection (pixel-based, works great on mobile)
    this.map.on('singleclick', (evt) => {
      // hitTolerance gives a generous tap area around each pin
      const feature = this.map.forEachFeatureAtPixel(
        evt.pixel,
        (f) => f,
        { hitTolerance: 20 } // 20px tolerance — easy to tap on mobile
      );

      if (feature) {
        const alert = feature.get('alertData');
        if (alert) {
          this.alertSelected.emit(alert);
          return; // pin was tapped, don't drop a report pin
        }
      }
    });

    // Long press — drop a report pin (only if no alert pin tapped)
    let longPressTimeout: any;
    let moved = false;

    this.map.getViewport().addEventListener('pointerdown', () => {
      moved = false;
      longPressTimeout = setTimeout(() => {
        if (!moved) {
          const center = this.map.getView().getCenter();
          if (center) {
            const [lon, lat] = toLonLat(center);
            this.reportLocation.emit({ lat, lng: lon, address: `${lat.toFixed(4)}, ${lon.toFixed(4)}` });
          }
        }
      }, 800);
    });

    this.map.getViewport().addEventListener('pointermove', () => {
      moved = true;
    });

    this.map.getViewport().addEventListener('pointerup', () => {
      clearTimeout(longPressTimeout);
    });

    this.updateMapMarkers();
  }


  
}