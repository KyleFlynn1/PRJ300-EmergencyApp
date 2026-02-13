import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Report } from 'src/app/interfaces/report.interface';
import { Alert } from 'src/app/services/alerts/alert';
import { getAlertSeverityColor, getCircleAlertSVG, getIcon } from 'src/app/utils/modalUtil';
import { RouterModule } from '@angular/router';
import {ReportModalComponent} from '../report-modal/report-modal.component';

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
  // Control to  show update form or detail view
  showform: boolean = false;
  @Input() isNativeModal : boolean = false;
  @Input() alert?: Report;
  
  // OpenLayers map instance
  map?: Map;

  //  inject services required
  constructor(
    private modalController: ModalController,
    private alertService: Alert
  ) {}

  // Log the alert recieved and details to make sure its working correct
  ngOnInit() {
    console.log('AlertDetailModal received alert:', this.alert);
  }

  // Initialize map after view is ready to avoid errors or map not showing
  ngAfterViewInit() {
    // Initialize map after view is ready
    setTimeout(() => this.initMap(), 100);
  }

  // Initialize the map with OpenLayers
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

    // Use the same SVG pin style as the main map
    const color = getAlertSeverityColor(this.alert?.severity);
    const svgUrl = getCircleAlertSVG(color);
    feature.setStyle(
      new Style({
        image: new OLIcon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: svgUrl,
          scale: 0.28
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

  // Show update form to edit alert with CRUD operations
  updateAlert() {
    this.showform = true;
  }

  // Handle form close event
  handleFormClose(data: any) {
    if (data) {
      // Form was submitted, close the detail modal
      this.closeDetailedView();
    } else {
      // Form was cancelled, go back to detail view
      this.showform = false;
    }
  }

  // Delete alert using alert service and close modal on success
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