import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Icon } from 'ionicons/dist/types/components/icon/icon';
import { Report } from 'src/app/interfaces/report.interface';
import { getAlertSeverityColor, getIcon } from 'src/app/utils/modalUtil';

@Component({
  selector: 'app-alert-detail-modal',
  templateUrl: './alert-detail-modal.component.html',
  styleUrls: ['./alert-detail-modal.component.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true,
})
export class AlertDetailModalComponent  implements OnInit {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;
  
  @Input() alert?: Report;

  constructor(
    private modalController: ModalController
  ) {}

  ngOnInit() {
    console.log('AlertDetailModal received alert:', this.alert);
  }

  closeDetailedView() {
    this.modalController.dismiss(null, 'cancel');
  }
}