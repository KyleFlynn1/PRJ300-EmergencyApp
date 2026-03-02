import { Injectable } from '@angular/core';
import { signUp, signIn, confirmSignUp, signOut, getCurrentUser, fetchAuthSession, resetPassword, confirmResetPassword, resendSignUpCode } from '@aws-amplify/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';

interface CognitoUserInfo {
  cognitoId: string;
  email: string;
  emailVerified: boolean;
  username: string;
  nickname?: string;
  groups: string[];
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private userInfoSubject = new BehaviorSubject<CognitoUserInfo | null>(null);
  public userInfo$ = this.userInfoSubject.asObservable();
  
  private apiUrl = environment.apiBaseUrl + '/api/v1'; // Express API URL

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const user = await getCurrentUser();
      localStorage.removeItem('guestMode');
      this.currentUserSubject.next(user);
      await this.loadUserInfo();
    } catch (err) {
      this.currentUserSubject.next(null);
      this.userInfoSubject.next(null);
    }
  }

  async signUp(email: string, password: string, attributes?: any) {
    try {
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            ...attributes
          }
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async confirmSignUp(email: string, code: string) {
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
    } catch (error) {
      throw error;
    }
  }
  async resendSignUpCode(email: string) {
  try {
    await resendSignUpCode({ username: email });
  } catch (error) {
    throw error;
  }
}

async forgotPassword(email: string) {
  try {
    await resetPassword({ username: email });
  } catch (error) {
    throw error;
  }
}

async forgotPasswordSubmit(email: string, code: string, newPassword: string) {
  try {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword: newPassword });
  } catch (error) {
    throw error;
  }
}

  async signIn(email: string, password: string) {
    try {
      const user = await signIn({ username: email, password: password });
      localStorage.removeItem('guestMode');
      this.currentUserSubject.next(user);

      await this.loadUserInfo();
      
      // After successful login, sync with your Express API
      void this.syncUserWithBackend().catch((syncError) => {
        console.warn('User sync failed after login:', syncError);
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    try {
      await signOut();
      this.currentUserSubject.next(null);
      this.userInfoSubject.next(null);
    } catch (error) {
      throw error;
    }
  }

  async getIdToken(): Promise<string> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || '';
    } catch (error) {
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || '';
    } catch (error) {
      throw error;
    }
  }

  async loadUserInfo() {
    try {
      const token = await this.getIdToken();
      const userInfo = await firstValueFrom(this.http.get<CognitoUserInfo>(`${this.apiUrl}/users/cognito/me`, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }).pipe(timeout(5000))
    );
      this.userInfoSubject.next(userInfo);
      return userInfo;
    } catch (error) {
      console.error('Error loading user info:', error);
      this.userInfoSubject.next(null);
      throw error;
    }
  }

  async syncUserWithBackend() {
    try {
      const token = await this.getAccessToken();
      const user = await getCurrentUser();
      
      // Send user info to your Express API to create/update user profile
      return firstValueFrom(this.http.post(`${this.apiUrl}/users/cognito/sync`, {
        cognitoId: user.username,
        email: user.signInDetails?.loginId
      }, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }).pipe(timeout(8000)));
    } catch (error) {
      throw error;
    }
  }

  // Method to make authenticated API calls
  async makeAuthenticatedRequest(endpoint: string, method: string = 'GET', data?: any): Promise<Observable<any>> {
    const token = await this.getAccessToken();
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    switch (method) {
      case 'GET':
        return this.http.get(`${this.apiUrl}${endpoint}`, { headers });
      case 'POST':
        return this.http.post(`${this.apiUrl}${endpoint}`, data, { headers });
      case 'PUT':
        return this.http.put(`${this.apiUrl}${endpoint}`, data, { headers });
      case 'DELETE':
        return this.http.delete(`${this.apiUrl}${endpoint}`, { headers });
      default:
        throw new Error('Invalid HTTP method');
    }
  }

  // Returns the current Cognito user 
  async getCurrentUser(): Promise<any> {
    let user = this.currentUserSubject.getValue();
    if (user) {
      localStorage.removeItem('guestMode');
      return user;
    }
    try {
      user = await getCurrentUser();
      localStorage.removeItem('guestMode');
      this.currentUserSubject.next(user);
      return user;
    } catch (err) {
      this.currentUserSubject.next(null);
      return null;
    }
  }

  isadmin(): boolean {
    const userInfo = this.userInfoSubject.getValue();
    return userInfo?.isAdmin || false;
  }

  getUserInfo(): CognitoUserInfo | null {
    return this.userInfoSubject.getValue(); 
  }
}
