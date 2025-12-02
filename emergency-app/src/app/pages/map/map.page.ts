import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons } from '@ionic/angular'
import { IonicModule, MenuController } from "@ionic/angular";
import { MapComponent } from 'src/app/components/map/map.component';
import { getAlertSeverityColor, getFormattedTimestamp, getIcon } from 'src/app/utils/modalUtil';
import { Alert } from 'src/app/services/alerts/alert';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { AlertDetailModalComponent } from 'src/app/components/alert-detail-modal/alert-detail-modal.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MapComponent, ReportModalComponent, AlertDetailModalComponent]
})
export class MapPage implements OnInit {
  openMenu() {
    this.menuController.open();
  }
  // Call utility functions
    getAlertSeverityColor = getAlertSeverityColor;
    getIcon = getIcon;
    getFormattedTimestamp = getFormattedTimestamp;
  
    // Test Data
    activeAlerts: any[] = [];
    activeAlertsCount: number = 5;
    recentBroadcasts: any[] = [];
  
    // Modal state if they are opened or closed
    showReportModal: boolean = false;
    showAlertDetailModal: boolean = false;
    selectedAlert: any = null;
  
    constructor(
      private alertService: Alert,
      private menuController: MenuController
    ) { }
  
    ngOnInit() {
      this.alertService.getAlerts().subscribe(alerts => {
        // Sort by timestamp descending (newest first)
        this.activeAlerts = alerts.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.activeAlertsCount = alerts.length;
      });
    }
  
    // Open and close report modal methods
    openReportModal() {
      this.showReportModal = true;
    }
  
    closeReportModal(){
      this.showReportModal = false;
    }
  
    // Handle report modal close event
    handleReportClose(date: any) {
      this.closeReportModal();
      if (date) {
        console.log('Report submitted with date:', date);
        this.alertService.getAlerts().subscribe({
          next: (alerts) => {
            this.activeAlerts = alerts.sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.activeAlertsCount = this.activeAlerts.length;
        }
      });
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
