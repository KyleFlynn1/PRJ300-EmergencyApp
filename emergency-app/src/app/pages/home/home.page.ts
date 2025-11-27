import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { AlertDetailModalComponent } from 'src/app/components/alert-detail-modal/alert-detail-modal.component';
import { ModalController, MenuController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';
import { getAlertSeverityColor, getIcon } from 'src/app/utils/modalUtil';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReportModalComponent, AlertDetailModalComponent]
})
export class HomePage implements OnInit {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;

  // Test Data
  activeAlerts: any[] = [];
  activeAlertsCount: number = 5;
  recentBroadcasts: any[] = [];

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

  openReportModal() {
    this.showReportModal = true;
  }

  closeReportModal(){
    this.showReportModal = false;
  }

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

  openAlertDetailModal(alert?: any) {
    this.selectedAlert = alert;
    this.showAlertDetailModal = true;
  }

  closeAlertDetailModal(){
    this.showAlertDetailModal = false;
    this.selectedAlert = null;
  }

  openMenu() {
    this.menuController.open();
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

}
