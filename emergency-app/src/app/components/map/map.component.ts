import { Component, AfterViewInit, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
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
import { Icon, Style, Circle as CircleStyle, RegularShape, Fill, Stroke } from 'ol/style';
import { getAlertSeverityColor, getCircleAlertSVG } from 'src/app/utils/modalUtil';
import { Alert } from 'src/app/services/alerts/alert';

@Component({
  selector: 'app-map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [IonicModule],
})

export class MapComponent  implements OnInit, AfterViewInit, OnChanges {
    @ViewChild('mapContainer', { static: true }) mapContainer?: ElementRef<HTMLDivElement>;

    ngOnDestroy() {
      if (this.map) {
        this.map.setTarget(undefined);
        this.map = undefined;
      }
    }
  map: Map | undefined;

  // Emit selected alert to parent (no window events needed)
  @Output() alertSelected = new EventEmitter<any>();
  @Output() reportLocation = new EventEmitter<{ lat: number; lng: number; address: string }>();

  // User location, set from geolocation service
  userLat?: number;
  userLng?: number;

  // Pins to show on map, passed from parent
  @Input() pins: { lon: number; lat: number; title: string; data: any }[] = [];

  // Pin dropped by user (for reporting)
  droppedPin?: { lon: number; lat: number; address?: string };

  constructor(
    private alertService: Alert,
    private geolocationService: GeolocationService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    // Reinitialize map if already created to update pins
    if (this.map) {
      this.updateMapMarkers();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pins'] && this.map) {
      this.refreshPins();
    }
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
    this.initMap();
  }

  // refresh pins public method
  refreshPins() {
    if (this.map) {
      this.updateMapMarkers();
      setTimeout(() => this.map?.updateSize(), 0);
    }
  }
  
  // Update map markers without recreating the entire map
  private updateMapMarkers() {
    if (!this.map) return;
    const map = this.map;

    // Remove old marker layer
    const layers = map.getLayers();
    layers.forEach(layer => {
      if (layer instanceof VectorLayer) {
        map.removeLayer(layer);
      }
    });
    
    // Recreate features with updated pins
    const features = this.pins.map(pin => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([pin.lon, pin.lat]))
      });
      // If pin is an alert, use alert styling
      if (pin.data && pin.data.severity) {
        feature.set('alertData', pin.data);
        const color = getAlertSeverityColor(pin.data.severity);
        const svgUrl = getCircleAlertSVG(color);
        feature.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              src: svgUrl,
              scale: 0.28
            })
          })
        );
      } else {
        // Otherwise, treat as defib and use defib icon
        feature.set('defibData', pin.data);
        feature.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: 'assets/defibMarker.png',
              scale: 0.015
            })
          })
        );
      }
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
    map.addLayer(markerLayer);
  }

  // Initialize the map with OpenLayers
  initMap() {
    const targetElement = this.mapContainer?.nativeElement;
    if (!targetElement) return;

    this.map = new Map({
      target: targetElement,
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

    const map = this.map;
    if (!map) return;

    // Single tap with Openlayer built in pixel detection
    map.on('singleclick', (evt) => {
      // hitTolerance for area around pin to count 20 px for mobile so it dosnt need to be accurate
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (f) => f,
        { hitTolerance: 20 } 
      );

      // Send alert for a selected and open detailed view with single click
      if (feature) {
        const alert = feature.get('alertData');
        if (alert) {
          this.alertSelected.emit(alert);
          return;
        }
      }
    });

    // Long press for dropping a pin and open a report form with the locatin filled in for that address and lon and lat
    let longPressTimeout: any;
    let moved = false;
    let pressEvent: PointerEvent | null = null;

    map.getViewport().addEventListener('pointerdown', (e: PointerEvent) => {
      moved = false;
      pressEvent = e;
      longPressTimeout = setTimeout(async () => {
        if (!moved && pressEvent) {
          // Use OL's getEventPixel to correctly convert the DOM event to map pixel
          const pixel = map.getEventPixel(pressEvent);
          const coord = map.getCoordinateFromPixel(pixel);
          const [lon, lat] = toLonLat(coord);

          // Reverse geocode to get the actual address
          const address = await this.geolocationService.reverseGeoloc(lat, lon);

          // Emit to parent with resolved address
          this.reportLocation.emit({ lat, lng: lon, address });
        }
      }, 800);
    });

    map.getViewport().addEventListener('pointermove', () => {
      moved = true;
    });

    map.getViewport().addEventListener('pointerup', () => {
      clearTimeout(longPressTimeout);
    });

    this.updateMapMarkers();
    setTimeout(() => map.updateSize(), 0);
  }

  
}