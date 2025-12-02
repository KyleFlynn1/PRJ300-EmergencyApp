import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { AlertDetailModalComponent } from 'src/app/components/alert-detail-modal/alert-detail-modal.component';
import { ModalController, MenuController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';
import { getAlertSeverityColor, getIcon, getFormattedTimestamp } from 'src/app/utils/modalUtil';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReportModalComponent, AlertDetailModalComponent, RouterLink]
})
export class HomePage implements OnInit {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;
  getFormattedTimestamp = getFormattedTimestamp;

  // Test Data
  activeAlerts: any[] = [];
  // Alerts filtered in a 10km radius
  activeAlertsInArea: any[] = [];
  activeAlertsCount: number = 5;
  recentBroadcasts: any[] = [];

  // User location hard coded for sligo for testing later got from phone gps
  userLat: number = 54.272470; 
  userLng: number = -8.473997;
  // Radius around user location to show alerts on home page
  userRadiusDistance : number = 20; // in km

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
      
      // Filter alerts within 10km radius
      this.filterAlertsInRadius();
    });
  }

  // Calculate distance between two coordinates using Haversine formula
  // Copilot maths for getting lon and lat distance in km to be used in filtering
  private getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  // Filter alerts within 10km radius
  private filterAlertsInRadius() {
    this.activeAlertsInArea = this.activeAlerts.filter(alert => {
      if (!alert.location?.lat || !alert.location?.lng) {
        return false; // Skip alerts without coordinates
      }
      const distance = this.getDistance(
        this.userLat,
        this.userLng,
        alert.location.lat,
        alert.location.lng
      );
      return distance <= this.userRadiusDistance; // Within 10km from the variable
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
        this.filterAlertsInRadius(); // Update filtered alerts
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

  // Open side menu for navigation
  openMenu() {
    this.menuController.open();
  }
}
