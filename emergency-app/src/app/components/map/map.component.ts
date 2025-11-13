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

@Component({
  selector: 'app-map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [IonicModule],
})

export class MapComponent  implements OnInit {
  map!: Map;
  pins = [
    { lon: -8.0, lat: 53.4, title: 'Unknown' }
    //{ lon: -8.0, lat: 53.4, title: 'Unknown' }
  ];
  ngOnInit() {
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
    //below adds a layer onto of the map for markers (stored in features)
    const markerLayer = new VectorLayer({
      source: new VectorSource({ features })
    });

    this.map = new Map({
      target: mapElement, 
      layers: [tileLayer, markerLayer],
      view: new View({
        center: fromLonLat([-8.0, 53.4]), //this is the loaction of ireland approx
        zoom: 7 //this coom makes ireland take up the whole map
      })
    });
  }
}