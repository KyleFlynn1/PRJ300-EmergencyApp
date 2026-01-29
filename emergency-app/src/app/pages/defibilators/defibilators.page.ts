import { Component, OnInit, AfterViewInit } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { AddDefibModalComponent } from 'src/app/components/add-defib-modal/add-defib-modal.component';
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

@Component({
  selector: 'app-defibilators',
  templateUrl: './defibilators.page.html',
  styleUrls: ['./defibilators.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AddDefibModalComponent]
})
export class DefibilatorsPage implements OnInit, AfterViewInit {
  map?: Map;
  markerSource?: VectorSource;
  showAddDefibModal: boolean = false;

  // User location, set from geolocation service
  userLat?: number;
  userLng?: number;
  
  // Sample defibrillator locations in Ireland
  defibLocations = [
    { lon: -8.0, lat: 53.4, title: 'Cork City Center', address: 'Main St, Cork' },
    { lon: -7.9, lat: 53.3, title: 'Cork University Hospital', address: 'Wilton, Cork' },
    { lon: -8.1, lat: 53.5, title: 'Blackpool Community Center', address: 'Blackpool, Cork' },
    { lon: -6.26, lat: 53.35, title: 'Dublin City Hall', address: "O'Connell St, Dublin" },
    { lon: -9.05, lat: 53.27, title: 'Galway City Center', address: 'Shop St, Galway' },
    { lon: -8.47, lat: 51.90, title: 'Limerick City', address: 'O\'Connell St, Limerick' },
    { lon: -8.47, lat: 54.27, title: 'Sligo Town Center', address: 'O\'Connell St, Sligo' },
    { lon: -8.48, lat: 54.26, title: 'Sligo University Hospital', address: 'The Mall, Sligo' },
    { lon: -8.46, lat: 54.28, title: 'Sligo ATU Campus', address: 'Ash Lane, Sligo' },
    { lon: -8.49, lat: 54.27, title: 'Sligo Train Station', address: 'Lord Edward St, Sligo' },
    { lon: -8.47, lat: 54.29, title: 'Sligo Sports Complex', address: 'Cleveragh Rd, Sligo' },
    { lon: -8.45, lat: 54.27, title: 'Sligo Library', address: 'Stephen St, Sligo' }
];

  constructor(private menuController: MenuController, private geolocationService: GeolocationService) {}

  async ngOnInit() {
    // Don't initialize location here, wait for ngAfterViewInit
  }
  // Get and set user location, with user-friendly error handling
  private async getAndSetUserLocation(): Promise<boolean> {
    try {
      const position = await this.geolocationService.getCurrentLocation();
      if (position) {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        console.log('Defib page - User location:', this.userLat, this.userLng);
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
    // Get location first
    await this.getAndSetUserLocation();
    // Then initialize map with location
    setTimeout(() => this.initMap(), 100);
  }

  // Initialize the map with OpenLayers
  initMap() {
    const mapElement = document.getElementById('defib-map');
    if (!mapElement) {
      console.error('Defib map element not found');
      return;
    }

    const tileLayer = new TileLayer({ source: new OSM() });

    // Create markers for each defibrillator location
    const features = this.defibLocations.map(defib => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([defib.lon, defib.lat])),
        name: defib.title
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'assets/defibMarker.png',
            scale: 0.015
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

    // Store the vector source so we can add markers later
    this.markerSource = new VectorSource({ features });

    const markerLayer = new VectorLayer({
      source: this.markerSource
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

  // Open and close add defibrillator modal
  openAddDefibModal() {
    this.showAddDefibModal = true;
  }

  closeAddDefibModal() {
    this.showAddDefibModal = false;
  }

  // Handle submission of new defibrillator data
  handleDefibSubmit(data: any) {
    this.closeAddDefibModal();
    if (data && data.location) {
      console.log('New defibrillator added:', data);
      
      // Add to locations array
      this.defibLocations.push({
        lon: data.location.lng,
        lat: data.location.lat,
        title: data.accessInstructions || 'New Defibrillator',
        address: data.location.address
      });

      // Add marker to map
      this.addMarkerToMap(data.location.lng, data.location.lat, data.accessInstructions || 'New Defibrillator');
    }
  }

  // Add a new marker to the map for the newly added defibrillator
  addMarkerToMap(lon: number, lat: number, title: string) {
    if (!this.markerSource) {
      console.error('Marker source not initialized');
      return;
    }

    // Create new marker feature
    const feature = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
      name: title
    });

    feature.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'assets/defibMarker.png',
          scale: 0.015
        })
      })
    );

    // Add to map
    this.markerSource.addFeature(feature);

    // Center map on new marker with animation
    if (this.map) {
      this.map.getView().animate({
        center: fromLonLat([lon, lat]),
        zoom: 12,
        duration: 1000
      });
    }
  }

  openMenu() {
    this.menuController.open();
  }
}
