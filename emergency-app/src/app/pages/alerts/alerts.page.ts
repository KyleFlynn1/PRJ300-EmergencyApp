import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';
import { ModalController } from '@ionic/angular';
import { AlertDetailModalComponent } from 'src/app/components/alert-detail-modal/alert-detail-modal.component';
import { getAlertSeverityColor, getIcon, getFormattedTimestamp} from 'src/app/utils/modalUtil';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.page.html',
  styleUrls: ['./alerts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AlertDetailModalComponent]
})
export class AlertsPage implements OnInit {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;
  getFormattedTimestamp = getFormattedTimestamp;

  // Alert data and filtering state to store alerts and manage filters
  allAlerts: any[] = []; 
  filteredAlerts: any[] = []; 
  alerts: any[] = []; 

  // Filtering state stored here
  selectedSeverityFilter: string = 'all'; 
  searchTerm: string = ''; 

  // Native alert detail modal state
  showAlertDetailModal: boolean = false;
  selectedAlert: any = null;

  // Pagination using infinite scroll ionic component
  pageSize: number = 20;
  currentPage: number = 0;
  infiniteScrollDisabled: boolean = false;

  // User location for distance calculations
  userLat: number | null = null;
  userLng: number | null = null;

  constructor(
    private alertService: Alert,
    private menuController: MenuController,
    private geolocationService: GeolocationService
  ) { }

  // Fetch alerts on component initialization to keep data up to date
  async ngOnInit() {
    // Get user's current location
    await this.getUserLocation();
    
    this.alertService.getAlerts().subscribe(alerts => {
      // Sort by timestamp descending (newest first)
      this.alerts = alerts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      this.allAlerts = alerts;
      this.filteredAlerts = alerts;
      this.loadMoreAlerts(); // Load first batch
    });
  }

  // Reset pagination and reload alerts when the view is about to enter
  ionViewWillEnter() {
    // Reset pagination state when returning to the page
    this.infiniteScrollDisabled = false;
    this.currentPage = 0;
    this.alerts = [];
    this.loadMoreAlerts();
  }

  // Functions for handling filter changes
  onFilterChange(event: any) {
    this.selectedSeverityFilter = typeof event === 'string' ? event : event?.detail?.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    const val = event?.target?.value ?? event?.detail?.value ?? '';
    this.searchTerm = String(val).toLowerCase();
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }


  // Apply filters to alerts based on severity and search term
  applyFilters() {
    let filtered = this.allAlerts;
    console.log('All alerts:', this.allAlerts.map(a => ({ category: a.category, timestamp: a.timestamp })));
    
    // Apply severity filter
    if (this.selectedSeverityFilter !== 'all') {
      filtered = filtered.filter(alert => 
        alert.severity.toLowerCase() === this.selectedSeverityFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(alert => 
        (alert.category && alert.category.toLowerCase().includes(this.searchTerm)) ||
        (alert.type && alert.type.toLowerCase().includes(this.searchTerm)) ||
        (alert.notes && alert.notes.toLowerCase().includes(this.searchTerm))
      );
    }
    
    this.filteredAlerts = filtered;
    this.currentPage = 0;
    this.alerts = [];
    this.infiniteScrollDisabled = false;
    this.loadMoreAlerts(); // Load first batch of filtered results
  }

  // load more alerts for infinite scroll implementation
  loadMoreAlerts(event?: any) {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    const newAlerts = this.filteredAlerts.slice(start, end);
    
    this.alerts = [...this.alerts, ...newAlerts];
    this.currentPage++;
    
    // Check all alerts are loaded
    if (this.alerts.length >= this.filteredAlerts.length) {
      this.infiniteScrollDisabled = true;
    }
    
    if (event) {
      event.target.complete();
    }
  }

  // Open native alert detail modal
  openAlertDetailModal(alert?: any) {
    this.selectedAlert = alert ?? null;
    this.showAlertDetailModal = true;
  }


  // Close native alert detail modal
  closeAlertDetailModal() {
    this.showAlertDetailModal = false;
    this.selectedAlert = null;
  }


  // Handle scroll event for infinite scroll
  onScroll(event: any) {
    const element = event.target;
    const threshold = 100; // Load more when 100px from bottom
    
    if (element.scrollHeight - element.scrollTop - element.clientHeight < threshold) {
      if (!this.infiniteScrollDisabled) {
        this.loadMoreAlerts();
      }
    }
  }


  // Get user's current location
  async getUserLocation() {
    try {
      const position = await this.geolocationService.getCurrentLocation();
      if (position) {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  }

  // Calculate distance between two coordinates in kilometers
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  // Convert degrees to radians
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get formatted distance string
  getDistanceString(alert: any): string {
    if (!this.userLat || !this.userLng || !alert.location?.lat || !alert.location?.lng) {
      return 'Unknown distance';
    }
    
    const distance = this.calculateDistance(
      this.userLat,
      this.userLng,
      alert.location.lat,
      alert.location.lng
    );
    
    return `${distance.toFixed(1)}km away`;
  }
}
