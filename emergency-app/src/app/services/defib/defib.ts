import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Defib } from 'src/app/interfaces/defib.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root',
})

// Defib endpoint for backend to get and post defib data
export class DefibService {
private http = inject(HttpClient);
  private readonly apiUrls = [
    // To use backend with mobile device get the laptop or computer ip and replace localhost with that ip address
    `${environment.apiBaseUrl}/api/v1/defibs`, // primary
  ];

  private apiUrl = this.apiUrls[0];

  constructor() {
    // If primary fails, switch to fallback
    this.http.get(this.apiUrls[0], { observe: 'response' }).subscribe({
      error: () => (this.apiUrl = this.apiUrls[1]),
    });
  }
  private defibs: Defib[] = [];
  private defibsSubject = new BehaviorSubject<Defib[]>(this.defibs);


  private apiHeaders = { 'X-API-Key': 'blahblah' };

  // Get all defibs
  getDefibs(): Observable<Defib[]> {
    return this.http.get<Defib[]>(this.apiUrl);
  }

  // Get a defib by id
  getDefibById(id: string): Observable<Defib> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Defib>(url, { headers: this.apiHeaders });
  }

  // Add a new defib
  addDefib(defib: Defib): Observable<Defib> {
    return this.http.post<Defib>(this.apiUrl, defib, { headers: this.apiHeaders }).pipe(
    tap((newDefib) => {
      this.defibs = [newDefib, ...this.defibs];
      this.defibsSubject.next(this.defibs);
      })
    );
  }

  // Update a defib
  updateDefib(id: string, defib: Defib): Observable<Defib> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Defib>(url, defib, { headers: this.apiHeaders }).pipe(
      tap((updatedDefib) => {
        this.defibs = this.defibs.map(d => d._id === id ? updatedDefib : d);
        this.defibsSubject.next(this.defibs);
      })
    );
  }

  // Delete a defib
  deleteDefib(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.apiHeaders }).pipe(
      tap(() => {
        this.defibs = this.defibs.filter(defib => defib._id !== id);
        this.defibsSubject.next(this.defibs);
      })
    );
  }

  get defibs$(): Observable<Defib[]> {
    return this.defibsSubject.asObservable();
  }
}
