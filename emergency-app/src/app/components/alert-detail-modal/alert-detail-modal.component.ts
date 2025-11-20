import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Icon } from 'ionicons/dist/types/components/icon/icon';
import { Report } from 'src/app/interfaces/report.interface';

@Component({
  selector: 'app-alert-detail-modal',
  templateUrl: './alert-detail-modal.component.html',
  styleUrls: ['./alert-detail-modal.component.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true,
})
export class AlertDetailModalComponent  implements OnInit {

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

  getAlertSeverityColor(severity?: string) : string {
    switch (severity?.toLowerCase()) {
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
}