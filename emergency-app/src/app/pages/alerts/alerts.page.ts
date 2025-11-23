import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';
import { ModalController } from '@ionic/angular';
import { AlertDetailModalComponent } from 'src/app/components/alert-detail-modal/alert-detail-modal.component';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.page.html',
  styleUrls: ['./alerts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AlertsPage implements OnInit {

  allAlerts: any[] = [];  // All alerts from database
  filteredAlerts: any[] = []; // Filtered alerts based on search/filter
  alerts: any[] = []; // Alerts to display (paginated)

  selectedSeverityFilter: string = 'all'; // Filter via buttons and by severity
  searchTerm: string = '';  // Search for alert by category or type
  selectedDateFilter: string = ''; // Date and Time filter for alerts

  // Pagination
  pageSize: number = 7; // Load 7 alerts at a time and load more when scrolling using ion infinite scroll
  currentPage: number = 0;
  infiniteScrollDisabled: boolean = false;

  constructor(
    private alertService: Alert,
    private modalController: ModalController
  ) { }

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

  ionViewWillEnter() {
    // Reset pagination state when returning to the page
    this.infiniteScrollDisabled = false;
    this.currentPage = 0;
    this.alerts = [];
    this.loadMoreAlerts();
  }

  onFilterChange(event: any) {
    this.selectedSeverityFilter = event.detail.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value.toLowerCase();
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }


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

  // Get color for severity badge on alert card

  getAlertSeverityColor(severity: string) {
    switch (severity.toLowerCase()) {
      case 'info':
        return 'medium';
      case 'low':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'high':
        return 'danger';
      case 'urgent':
        return 'urgent';
      default:
        return 'medium';
    }
  }

  // Using Ionic icons for the premade categories get a matching icon to display on card with simple method
  getIcon(category?: string) {
    if (!category) return 'alert-circle';
    
    const c = category.toLowerCase();
    
    if (c.includes('tree') || c.includes('fallen')) return 'leaf';
    if (c.includes('injury')) return 'medkit';
    if (c.includes('person') || c.includes('missing')) return 'people';
    if (c.includes('power') || c.includes('outage')) return 'flash';
    if (c.includes('fire')) return 'flame';
    if (c.includes('flood') || c.includes('water')) return 'water';
    if (c.includes('road') || c.includes('blockage')) return 'car';
    if (c.includes('amber') || c.includes('missing')) return 'people';
    return 'alert-circle';
  }

  getFormattedTimestamp(timestamp: string): string {
    const alertDate = new Date(timestamp);
    const today = new Date();
    
    // Check if it's today by comparing date strings
    const isToday = alertDate.toDateString() === today.toDateString();
    
    if (isToday) {
      // Show only time if today
      return alertDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      // Show date and time if not today
      return alertDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ' ' + 
             alertDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  }

  async openAlertDetailModal(alert?: any) {
      const modal = await this.modalController.create({
        component: AlertDetailModalComponent,
        cssClass: 'floating-modal',
        backdropDismiss: true,
        showBackdrop: true,
        componentProps: {
          alert
        }
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (data) {
        console.log('Alert detail modal dismissed with data:', data);
      }
    }
}
