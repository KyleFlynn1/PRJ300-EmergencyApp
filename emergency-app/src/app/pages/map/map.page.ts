import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from "@ionic/angular";
import { MapComponent } from 'src/app/components/map/map.component';
import { getAlertSeverityColor, getFormattedTimestamp, getIcon } from 'src/app/utils/modalUtil';
import { Alert } from 'src/app/services/alerts/alert';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { AlertDetailModalComponent } from 'src/app/components/alert-detail-modal/alert-detail-modal.component';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MapComponent, ReportModalComponent, AlertDetailModalComponent]
})
export class MapPage implements ViewWillEnter {
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  openMenu() {
    this.menuController.open();
  }
  // Call utility functions
    getAlertSeverityColor = getAlertSeverityColor;
    getIcon = getIcon;
    getFormattedTimestamp = getFormattedTimestamp;
  
    // Test Data
    activeAlerts: any[] = [];
    pins: any[] = [];
    activeAlertsCount: number = 5;
    recentBroadcasts: any[] = [];
  
    // Modal state if they are opened or closed
    showReportModal: boolean = false;
    showAlertDetailModal: boolean = false;
    selectedAlert: any = null;
    reportModalLocation?: { lat: number, lng: number, address: string };
    currentTimestamp: string = new Date().toISOString();
  
    constructor(
      private alertService: Alert,
      private menuController: MenuController
    ) { }
  
    ionViewWillEnter() {
      this.alertService.getAlerts().subscribe(alerts => {
        this.activeAlerts = alerts.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.activeAlertsCount = alerts.length;
        this.pins = alerts
          .filter(alert => alert.location?.lng && alert.location?.lat)
          .map(alert => ({
            lon: alert.location.lng,
            lat: alert.location.lat,
            title: alert.category || 'Alert',
            data: alert
          }));
      });
    }

    ionViewDidEnter() {
      if (this.mapComponent) {
        this.mapComponent.refreshPins();
      }
    }
  
    // Open and close report modal methods

    openReportModal() {
      this.showReportModal = true;
      this.reportModalLocation = undefined;
    }

    // Open modal with pin location (from map)
    openReportModalWithLocation(lat: number, lng: number, address: string) {
      this.reportModalLocation = { lat, lng, address };
      this.showReportModal = true;
    }
  
    closeReportModal(){
      this.showReportModal = false;
    }
  
    // Handle report modal close event
    handleReportClose(date: any) {
      this.closeReportModal();
      if (date) {
        // Delay to ensure the report is saved on the backend before fetching
        setTimeout(() => {
          this.alertService.getAlerts().subscribe({
            next: (alerts) => {
              this.activeAlerts = alerts.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              this.activeAlertsCount = this.activeAlerts.length;
              // Refresh map pins and update map size after modal closes
              this.mapComponent.refreshPins();
            }
          });
        }, 500);
      }
    }
  
    // Open and close alert detail modal methods
    openAlertDetailModal(alert?: any) {
      this.selectedAlert = alert;
      this.showAlertDetailModal = true;
    }
  
    closeAlertDetailModal(){
      this.showAlertDetailModal = false;
      this.selectedAlert = null;
    }

    
}
