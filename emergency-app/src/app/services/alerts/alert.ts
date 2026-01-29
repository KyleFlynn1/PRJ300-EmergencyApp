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
  private readonly apiUrls = [
    // To use backend with mobile device get the laptop or computer ip and replace localhost with that ip address
    'http://localhost:3000/api/v1/alert',
    'http://192.168.5.75:3001/api/v1/alert', // fallback
  ];
  private apiUrl = this.apiUrls[0];

  constructor() {
    // If primary fails, switch to fallback
    this.http.get(this.apiUrls[0], { observe: 'response' }).subscribe({
      error: () => (this.apiUrl = this.apiUrls[1]),
    });
  }
  private alerts: Report[] = [];
  private alertsSubject = new BehaviorSubject<Report[]>(this.alerts);


  getAlerts(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }
  getAlertById(id: string): Observable<Report> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Report>(url);
  }


  addAlert(report: Report): Observable<Report> {
  return this.http.post<Report>(this.apiUrl, report).pipe(
    tap((newAlert) => {
      this.alerts = [newAlert, ...this.alerts];
      this.alertsSubject.next(this.alerts);
      })
    );
  }
  updateAlert(id: string, report: Report): Observable<Report> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Report>(url, report).pipe(
      tap((updatedAlert) => {
        this.alerts = this.alerts.map(alert =>
          alert._id === id ? updatedAlert : alert
        );
        this.alertsSubject.next(this.alerts);
      })
    );
  }
  deleteAlert(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this.alerts = this.alerts.filter(alert => alert._id !== id);
        this.alertsSubject.next(this.alerts);
      })
    );
  }

  get alerts$(): Observable<Report[]> {
    return this.alertsSubject.asObservable();
  }
}