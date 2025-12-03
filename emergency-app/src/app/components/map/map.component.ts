import { Component, AfterViewInit, OnInit } from '@angular/core';
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

  // Hardcoded user location for testing
  userLat: number = 54.272470; 
  userLng: number = -8.473997;

  //List of pins to show on map got from the alerts service with api
  pins: { lon: number; lat: number; title: string }[] = [];

  constructor(private alertService: Alert) {}

  ngOnInit() {
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
    });
  }

  // Make sure map is initialized after view is ready to avoid errors or map not showing
  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
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

    // Add user location marker
    // User cordinates hardcoded above for testing purposes to be got from gps on phone later
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

    //below adds a layer onto of the map for markers (stored in features)
    const markerLayer = new VectorLayer({
      source: new VectorSource({ features })
    });

    this.map = new Map({
      target: mapElement, 
      layers: [tileLayer, markerLayer],
      view: new View({
        center: fromLonLat([this.userLng, this.userLat]), //center on user location
        zoom: 13 //zoom in on user location
      })
    });
  }
}