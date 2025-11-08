import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

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

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  async openReportModal() {
    const modal = await this.modalController.create({
      component: ReportModalComponent,
      cssClass: 'floating-modal'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log('Report got succesfully:', data);
    }
  }
}
