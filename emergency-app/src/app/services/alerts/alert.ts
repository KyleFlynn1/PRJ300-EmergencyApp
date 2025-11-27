import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Report } from 'src/app/interfaces/report.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Alert {

  private http = inject(HttpClient);
  private apiUrl = 'http://192.168.5.75:3000/api/v1/alert';
  private alerts: Report[] = [];
  private alertsSubject = new BehaviorSubject<Report[]>(this.alerts);


  getAlerts(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }

  addAlert(report: Report): Observable<Report> {
  return this.http.post<Report>(this.apiUrl, report).pipe(
    tap((newAlert) => {
      this.alerts = [newAlert, ...this.alerts];
      this.alertsSubject.next(this.alerts);
      })
    );
  }
}
