import { Injectable } from '@angular/core';
import { Report } from 'src/app/interfaces/report.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Alert {

  private alerts: Report[] = [];

  private alertsSubject = new BehaviorSubject<Report[]>(this.alerts);

  alerts$ = this.alertsSubject.asObservable();

  constructor() {}

  addAlert(alert: Report): void {
    this.alerts.unshift(alert);
    this.alertsSubject.next(this.alerts);
  }

  getAlerts(): Report[] {
    return this.alerts;
  }
}
