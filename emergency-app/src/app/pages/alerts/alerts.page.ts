import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';


@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.page.html',
  styleUrls: ['./alerts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AlertsPage implements OnInit {

  alerts: any[] = [];

  constructor(
    private alertService: Alert
  ) { }

  ngOnInit() {
    this.alertService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });
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
}
