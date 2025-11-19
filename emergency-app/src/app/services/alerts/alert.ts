import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Report } from 'src/app/interfaces/report.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Alert {

  private http = inject(HttpClient);

  // ngrok URL of your Express API
  private apiUrl = 'https://blastostylar-merrie-transitionally.ngrok-free.dev/api/v1/alert';
  
  private alerts: Report[] = [];
  private alertsSubject = new BehaviorSubject<Report[]>(this.alerts);

  // Common headers for ngrok to skip browser warning
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  });

  getAlerts(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl, {
      headers: this.ngrokHeaders,
      responseType: 'json'
    });
  }

  addAlert(report: Report): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, report, {
      headers: this.ngrokHeaders
    }).pipe(
      tap((newAlert) => {
        // Update local BehaviorSubject so UI refreshes immediately
        this.alerts = [newAlert, ...this.alerts];
        this.alertsSubject.next(this.alerts);
      })
    );
  }
}
