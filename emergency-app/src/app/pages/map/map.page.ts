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
  @ViewChild('typeSelect', { static: false }) typeSelect: any;

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
    isGuest: boolean = true;

    // Filters
    selectedType = 'all';
    selectedStatus = 'all';
  
    constructor(
      private alertService: Alert,
      private menuController: MenuController
    ) { }
  
    async ionViewWillEnter() {
      this.isGuest = localStorage.getItem('guestMode') === 'true';

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

    openTypeSelect() {
      this.typeSelect.open();
    }

    // Filter by selection of alert type or if its activee based on if it was 24 hours old or not
    filterAlerts() {
      const now = new Date();
      const filteredAlerts = this.activeAlerts.filter(alert => {
        const alertTime = new Date(alert.timestamp);
        const isActive = (now.getTime() - alertTime.getTime()) < 24 * 60 * 60 * 1000;
        const alertCategory = (alert.category || '').toLowerCase().replace(/\s+/g, '-');
        const matchesType = this.selectedType === 'all' || alertCategory === this.selectedType;
        const matchesStatus = this.selectedStatus === 'all' || (this.selectedStatus === 'active' ? isActive : !isActive);
        return matchesType && matchesStatus;
      });

      this.pins = filteredAlerts
        .filter(alert => alert.location?.lng && alert.location?.lat)
        .map(alert => ({
          lon: alert.location.lng,
          lat: alert.location.lat,
          title: alert.category || 'Alert',
          data: alert
        }));

      if (this.mapComponent) {
        this.mapComponent.refreshPins();
      }
    }
  
    // Open and close report modal methods

    openReportModal() {
      if (this.isGuest) {
        return;
      }
      this.showReportModal = true;
      this.reportModalLocation = undefined;
    }

    // Open modal with pin location (from map)
    openReportModalWithLocation(lat: number, lng: number, address: string) {
      if (this.isGuest) {
        return;
      }
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
