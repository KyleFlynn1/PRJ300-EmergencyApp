import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Report } from 'src/app/interfaces/report.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Alert {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/alert';


  getAlerts(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }
  addAlert(report: Report): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, report);
  }
}
