import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Icon } from 'ionicons/dist/types/components/icon/icon';
import { Report } from 'src/app/interfaces/report.interface';
import { Alert } from 'src/app/services/alerts/alert';
import { getAlertSeverityColor, getIcon } from 'src/app/utils/modalUtil';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon as OLIcon, Style } from 'ol/style';
import { RouterModule } from '@angular/router';
import {ReportModalComponent} from '../report-modal/report-modal.component';

@Component({
  selector: 'app-alert-detail-modal',
  templateUrl: './alert-detail-modal.component.html',
  styleUrls: ['./alert-detail-modal.component.scss'],
  imports: [IonicModule, CommonModule, RouterModule, AsyncPipe, ReportModalComponent],
  standalone: true,
})
export class AlertDetailModalComponent  implements OnInit, AfterViewInit {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;
  showform: boolean = false;
  
  
  @Input() isNativeModal : boolean = false;
  @Input() alert?: Report;
  
  map?: Map;

  constructor(
    private modalController: ModalController,
    private alertService: Alert
  ) {}

  ngOnInit() {
    console.log('AlertDetailModal received alert:', this.alert);
  }

  ngAfterViewInit() {
    // Initialize map after view is ready
    setTimeout(() => this.initMap(), 100);
  }

  initMap() {
    const mapElement = document.getElementById('alert-detail-map');
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }

    // Use alert location or default to Ireland center
    const lon = this.alert?.location?.lng ?? -8.0;
    const lat = this.alert?.location?.lat ?? 53.4;

    const tileLayer = new TileLayer({ source: new OSM() });

    // Create marker for the alert location
    const feature = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    feature.setStyle(
      new Style({
        image: new OLIcon({
          anchor: [0.5, 1],
          src: 'assets/marker.png',
          scale: 0.1
        })
      })
    );

    const markerLayer = new VectorLayer({
      source: new VectorSource({ features: [feature] })
    });

    this.map = new Map({
      target: mapElement,
      layers: [tileLayer, markerLayer],
      view: new View({
        center: fromLonLat([lon, lat]),
        zoom: 15 // Zoomed in for alert detail
      })
    });
  }

  // Close modal
  async closeDetailedView() {
    if (!this.isNativeModal) {
      //console.warn('yes closeDetailedView called in non-native modal context');
      await this.modalController.dismiss();
    } else {
      //console.warn('no closeDetailedView called in native modal context');
      // If using native modal, navigate to home
      window.location.href = '/home';
    }
  }
  updateAlert() {
    this.showform = true;
  }
  deleteAlert() {
    if (this.alert && this.alert._id) {
      this.alertService.deleteAlert(this.alert._id).subscribe({
        next: () => {
          console.log('Alert deleted successfully');
          this.closeDetailedView();
        },
        error: (err) => {
          console.error('Error deleting alert:', err);
        }
      });
    }
  }
}