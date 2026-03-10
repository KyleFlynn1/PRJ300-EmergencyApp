import { inject, Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Report } from 'src/app/interfaces/report.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from 'src/environments/environment.prod';
import { Weather } from 'src/app/interfaces/weather.interface';
@Injectable({
  providedIn: 'root',
})

// Alert service to connect to api to get and post alerts and weather data
export class Alert {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  private readonly apiUrls = [
    // To use backend with mobile device get the laptop or computer ip and replace localhost with that ip address
    `${environment.apiBaseUrl}/api/v1/alert`,
  ];
  private apiUrl = this.apiUrls[0];
  private weatherApiUrl = `${environment.apiBaseUrl}/api/v1/weather`;

  constructor() {
    // If primary fails, switch to fallback
    this.http.get(this.apiUrls[0], { observe: 'response' }).subscribe({
      error: () => (this.apiUrl = this.apiUrls[1]),
    });
  }

  // Alerts saved locally to prevent instant filtering and less delay
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

  // Post request to ping backend to get weather data from met eireann and store in database
  getWeatherAlerts(): Observable<Weather[]> {
    const headers = { 'X-API-Key': "blahblah" };
    return this.http.post<Weather[]>(`${this.weatherApiUrl}/import`, { headers });
  }

  // Get all saved weather alerts from database
  getAllWeatherAlerts(): Observable<Weather[]> {
    return this.http.get<Weather[]>(this.weatherApiUrl);
  }

  // get all reports
  getAlerts(): Observable<Report[]> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) => this.http.get<Report[]>(this.apiUrl, { headers }))
    );
  }

  // Get a report by its id
  getAlertById(id: string): Observable<Report> {
    const url = `${this.apiUrl}/${id}`;
    return this.withAuthHeaders().pipe(
      switchMap((headers) => this.http.get<Report>(url, { headers }))
    );
  }

  // Post request for adding a alert
  addAlert(report: Report): Observable<Report> {
  return this.withAuthHeaders().pipe(
    switchMap((headers) => this.http.post<Report>(this.apiUrl, report, { headers })),
    tap((newAlert) => {
      this.alerts = [newAlert, ...this.alerts];
      this.alertsSubject.next(this.alerts);
    })
    );
  }

  // Update request for updating alerts
  updateAlert(id: string, report: Report): Observable<Report> {
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

  // Delete alerts
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