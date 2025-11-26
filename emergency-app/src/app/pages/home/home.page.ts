import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { AlertDetailModalComponent } from 'src/app/components/alert-detail-modal/alert-detail-modal.component';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';
import { getAlertSeverityColor, getIcon } from 'src/app/utils/modalUtil';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage implements OnInit {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;

  // Test Data
  activeAlerts: any[] = [];
  activeAlertsCount: number = 5;
  recentBroadcasts: any[] = [];

  constructor(
    private modalController: ModalController,
    private alertService: Alert
  ) { }

  ngOnInit() {
    this.alertService.getAlerts().subscribe(alerts => {
      this.activeAlerts = alerts;
      this.activeAlertsCount = alerts.length;
    });
  }

async openReportModal() {
  const modal = await this.modalController.create({
    component: ReportModalComponent,
    cssClass: 'floating-modal',
    backdropDismiss: true,
    showBackdrop: true
  });
  await modal.present();

  const { data } = await modal.onDidDismiss();

  // When modal sends back the new alert, refresh the list
  if (data) {
    console.log('Report received successfully:', data);

    // 🔄 Refresh list from API immediately
    this.alertService.getAlerts().subscribe({
      next: (alerts) => {
        this.activeAlerts = alerts;
        this.activeAlertsCount = alerts.length;
      },
      error: (err) => console.error('Failed to refresh alerts:', err)
    });
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
