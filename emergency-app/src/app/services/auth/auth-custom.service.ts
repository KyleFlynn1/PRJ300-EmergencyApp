import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, switchMap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthCustomService {
  readonly currentUser$ : BehaviorSubject<User | null> ;
  readonly isAuthenticated$ : BehaviorSubject<boolean>;


  private http = inject(HttpClient)

    constructor() {

    this.currentUser$ = new BehaviorSubject<User | null> 
    (JSON.parse(localStorage.getItem('user') || '{}'));

    const token = localStorage.getItem('token') || '';

    // if there is a token we need to check if it has
    // expired.
    
   if (token != "") {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expires = payload.exp *1000
    if (expires > Date.now()){
      this.isAuthenticated$ = new BehaviorSubject<boolean>(true)
      this.startAuthenticateTimer(expires);
    }
    else{
       this.isAuthenticated$ = new BehaviorSubject<boolean>(false) 
    }
  }
  else{
      this.isAuthenticated$ = new BehaviorSubject<boolean>(false)
    }
  }
  private Uri = `${environment.apiUrl}`;

  public login(email: string, password: string): Observable<any> {
    let expires = 0;
    let payloadUser: any = null;
    return this.http
      .post<any>(`${this.Uri}/auth`, { email: email, password: password })
      .pipe(
        map((body) => {
          const payload = JSON.parse(atob(body.accessToken.split('.')[1]));
          payloadUser = payload;
          expires = payload.exp * 1000;
          localStorage.setItem('token', body.accessToken);
          return null;
        }),
        switchMap(() => this.http.get<User>(`${this.Uri}/users/email/${email}`)
          .pipe(
            catchError(() => of(payloadUser as User))
          )
        ),
        map((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser$.next(user as User);
          this.isAuthenticated$.next(true);
          this.startAuthenticateTimer(expires);
          return;
        })
      );
  }

  public logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
  }

  private authenticateTimeout?: any;
  private startAuthenticateTimer(expires: number) {

    // set a timeout to re-authenticate with the api one minute before the token expires

    const timeout = expires - Date.now() - (60 * 1000);

    this.authenticateTimeout = setTimeout(() => {
      if (this.isAuthenticated$.value){
      
      // refresh tokens are not implmented yet so we logout instead.

      //this.getNewAccessToken().subscribe();
      this.logout();
      }
    }, timeout);
  }

  
}
