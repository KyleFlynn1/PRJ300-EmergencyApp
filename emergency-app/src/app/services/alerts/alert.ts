import { inject, Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Report } from 'src/app/interfaces/report.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root',
})
export class Alert {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  private readonly apiUrls = [
    // To use backend with mobile device get the laptop or computer ip and replace localhost with that ip address
    `${environment.apiBaseUrl}/api/v1/alert`,
  ];
  private apiUrl = this.apiUrls[0];

  private weatherApiUrl = `${environment.apiBaseUrl}/api/v1/weather/import`;

  constructor() {
    // If primary fails, switch to fallback
    this.http.get(this.apiUrls[0], { observe: 'response' }).subscribe({
      error: () => (this.apiUrl = this.apiUrls[1]),
    });
  }
  private alerts: Report[] = [];
  private alertsSubject = new BehaviorSubject<Report[]>(this.alerts);

  private withAuthHeaders(extraHeaders?: Record<string, string>): Observable<HttpHeaders> {
    return new Observable<HttpHeaders>((subscriber) => {
      this.authService.getAccessToken()
        .then((token) => {
          this.ngZone.run(() => {
            subscriber.next(new HttpHeaders({
              Authorization: `Bearer ${token}`,
              ...(extraHeaders ?? {}),
            }));
            subscriber.complete();
          });
        })
        .catch((error) => {
          this.ngZone.run(() => subscriber.error(error));
        });
    });
  }



  getWeatherAlerts(): Observable<Report[]> {
    return this.withAuthHeaders({ 'X-API-Key': 'blahblah' }).pipe(
      switchMap((headers) => this.http.post<Report[]>(this.weatherApiUrl, {}, { headers }))
    );
  }

  getAlerts(): Observable<Report[]> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) => this.http.get<Report[]>(this.apiUrl, { headers }))
    );
  }
  getAlertById(id: string): Observable<Report> {
    const url = `${this.apiUrl}/${id}`;
    return this.withAuthHeaders().pipe(
      switchMap((headers) => this.http.get<Report>(url, { headers }))
    );
  }


  addAlert(report: Report): Observable<Report> {
  return this.withAuthHeaders().pipe(
    switchMap((headers) => this.http.post<Report>(this.apiUrl, report, { headers })),
    tap((newAlert) => {
      this.alerts = [newAlert, ...this.alerts];
      this.alertsSubject.next(this.alerts);
    })
    );
  }
  updateAlert(id: string, report: Partial<Report>): Observable<Report> {
    const url = `${this.apiUrl}/${id}`;
    return this.withAuthHeaders().pipe(
      switchMap((headers) => this.http.put<Report>(url, report, { headers })),
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
    return this.withAuthHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(url, { headers })),
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