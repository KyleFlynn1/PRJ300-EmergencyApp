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
import { DefibService } from 'src/app/services/defib/defib';


@Component({
  selector: 'app-defib-detail-modal',
  templateUrl: './defib-detail-modal.component.html',
  styleUrls: ['./defib-detail-modal.component.scss'],
  imports: [IonicModule, CommonModule, RouterModule, ReportModalComponent],
  standalone: true,
})
export class DefibDetailModalComponent  implements OnInit, AfterViewInit {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;
  // Control to  show update form or detail view
  showform: boolean = false;
  @Input() isNativeModal : boolean = false;
  @Input() defib?: Report;
  
  // OpenLayers map instance
  map?: Map;

  //  inject services required
  constructor(
    private modalController: ModalController,
    private defibService: DefibService
  ) {}

  // Log the defib recieved and details to make sure its working correct
  ngOnInit() {
    console.log('DefibDetailModal received defib:', this.defib);
  }

  // Initialize map after view is ready to avoid errors or map not showing
  ngAfterViewInit() {
    // Initialize map after view is ready
    setTimeout(() => this.initMap(), 100);
  }

  // Initialize the map with OpenLayers
  initMap() {
    const mapElement = document.getElementById('defib-detail-map');
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }

    // Use defib location or default to Ireland center
    const lon = this.defib?.location?.lng ?? -8.0;
    const lat = this.defib?.location?.lat ?? 53.4;

    const tileLayer = new TileLayer({ source: new OSM() });

    // Create marker for the defib location
    const feature = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    // Use the same PNG pin style as the main map for defib
    feature.setStyle(
      new Style({
        image: new OLIcon({
          anchor: [0.5, 1],
          src: 'assets/defibMarker.png',
          scale: 0.015
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
        zoom: 15 // Zoomed in for defib detail
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

  // Check if a defib is Active or Inactive depending if its made within 24 hours and put a tag saying which
  CheckDefibActive(timestamp: string | Date | undefined | null): boolean {
    if (!timestamp) 
      return false; 
    
    const defibTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - defibTime.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24;
  }

  // Show update form to edit defib with CRUD operations
  updateDefib() {
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

  // Delete defib using defib service and close modal on success
  deleteDefib() {
    if (this.defib && this.defib._id) {
      this.defibService.deleteDefib(this.defib._id).subscribe({
        next: () => {
          console.log('Defib deleted successfully');
          this.closeDetailedView();
        },
        error: (err) => {
          console.error('Error deleting defib:', err);
        }
      });
    }
  }
}