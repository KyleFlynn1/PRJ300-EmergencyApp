import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReportModalComponent]
})
export class HomePage implements OnInit {
  
  // Test Data
  activeAlerts: any[] = [];
  activeAlertsCount: number = 5;
  recentBroadcasts: any[] = [];

  constructor(
    private modalController: ModalController,
    private alertService: Alert
  ) { }

  ngOnInit() {
    this.alertService.alerts$.subscribe(alerts => {
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
    if (data) {
      console.log('Report got succesfully:', data);
    }
  }

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
      default:
        return 'medium';
    }
  }

  // Using Ionic icons for the premade categories get a matching icon to display on card with simple method
  getIcon(category?: string) {
    if (!category) return 'alert-circle';
    
    const c = category.toLowerCase();
    
    if (c.includes('tree') || c.includes('fallen')) return 'leaf';
    if (c.includes('power') || c.includes('outage')) return 'flash';
    if (c.includes('fire')) return 'flame';
    if (c.includes('flood') || c.includes('water')) return 'water';
    if (c.includes('road') || c.includes('blockage')) return 'car';
    if (c.includes('amber') || c.includes('missing')) return 'people';
    return 'alert-circle';
  }

}
