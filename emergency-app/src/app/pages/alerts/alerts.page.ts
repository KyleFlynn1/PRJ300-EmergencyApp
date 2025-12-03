import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';
import { ModalController } from '@ionic/angular';
import { AlertDetailModalComponent } from 'src/app/components/alert-detail-modal/alert-detail-modal.component';
import { getAlertSeverityColor, getIcon, getFormattedTimestamp} from 'src/app/utils/modalUtil';

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

  constructor(
    private alertService: Alert,
    private menuController: MenuController
  ) { }

  // Fetch alerts on component initialization to keep data up to date
  ngOnInit() {
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

  // Open side menu for navigation
  openMenu() {
    this.menuController.open();
  }
}
