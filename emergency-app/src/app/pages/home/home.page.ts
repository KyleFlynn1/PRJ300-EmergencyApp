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
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReportModalComponent, AlertDetailModalComponent, RouterLink]
})
export class HomePage implements ViewWillEnter {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;
  getFormattedTimestamp = getFormattedTimestamp;

  // Test Data
  activeAlerts: any[] = [];
  // Alerts filtered in a 10km radius
  activeAlertsInArea: any[] = [];
  activeAlertsCount: number = 5;

  // User location, set from geolocation service
  userLat?: number;
  userLng?: number;
  // Radius around user location to show alerts on home page
  userRadiusDistance : number = 50; // in km

  // Modal state if they are opened or closed
  showReportModal: boolean = false;
  showAlertDetailModal: boolean = false;
  selectedAlert: any = null;

  constructor(
    private alertService: Alert,
    private menuController: MenuController,
    private geolocationService: GeolocationService
  ) { }

  // On component initialization fetch alerts and user location
  async ionViewWillEnter() {
    await this.getAndSetUserLocation();
    const savedRadius = localStorage.getItem('alertRadius');
    if (savedRadius) {
      this.userRadiusDistance = parseInt(savedRadius);
    }
    // Fetch both alerts and weather alerts, then merge
    this.alertService.getAlerts().subscribe(alerts => {
      this.alertService.getWeatherAlerts().subscribe(weatherAlerts => {
        const safeWeatherAlerts = Array.isArray(weatherAlerts) ? weatherAlerts : [];
        const allAlerts = [...alerts, ...safeWeatherAlerts];
        console.log('All alerts:', allAlerts);
        console.log('Weather alerts:', safeWeatherAlerts);
        this.activeAlerts = allAlerts.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.activeAlertsCount = this.activeAlerts.length;
        this.filterAlertsInRadius();
        console.log('Filtered alerts in area:', this.activeAlertsInArea);
      });
    });
  }
  // Get and set user location, with user-friendly error handling
  private async getAndSetUserLocation(): Promise<boolean> {
    try {
      const position = await this.geolocationService.getCurrentLocation();
      if (position) {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        console.log('User location:', this.userLat, this.userLng);
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

  // Getter for weather alerts
  get weatherAlerts() {
    // Show weather alerts from allAlerts, only filter by timestamp
    const now = new Date();
    return this.activeAlerts
      ?.filter(a => a.category === 'Weather Warning' &&
        (() => {
          const alertTime = new Date(a.timestamp);
          const hoursDifference = (now.getTime() - alertTime.getTime()) / (1000 * 60 * 60);
          return hoursDifference <= 24;
        })()
      ) || [];
  }


  // Filter alerts within radius and last 24 hours
  private filterAlertsInRadius() {
    if (this.userLat === undefined || this.userLng === undefined) {
      this.activeAlertsInArea = [];
      return;
    }
    
    const now = new Date();
    this.activeAlertsInArea = this.activeAlerts.filter(alert => {
      if (!alert.location?.lat || !alert.location?.lng) {
        return false; // Skip alerts without coordinates
      }
      
      // Check if alert is within 24 hours
      const alertTime = new Date(alert.timestamp);
      const hoursDifference = (now.getTime() - alertTime.getTime()) / (1000 * 60 * 60);
      if (hoursDifference > 24) {
        return false;
      }
      
      // Check if alert is within radius
      const distance = this.getDistance(
        this.userLat as number,
        this.userLng as number,
        alert.location.lat,
        alert.location.lng
      );
      return distance <= this.userRadiusDistance;
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

  // Get formatted distance string for alert card
  getDistanceString(alert: any): string {
    if (!this.userLat || !this.userLng || !alert.location?.lat || !alert.location?.lng) {
      return 'Unknown distance';
    }
    
    const distance = this.getDistance(
      this.userLat,
      this.userLng,
      alert.location.lat,
      alert.location.lng
    );
    
    return `${distance.toFixed(1)}km away`;
  }

  // Open side menu for navigation
  openMenu() {
    this.menuController.open();
  }
}
