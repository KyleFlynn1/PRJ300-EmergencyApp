import { Injectable } from '@angular/core';
import { signUp, signIn, confirmSignUp, signOut, getCurrentUser, fetchAuthSession, resetPassword, confirmResetPassword, resendSignUpCode } from '@aws-amplify/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = 'http://localhost:3000/api/v1'; // Your Express API URL

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const user = await getCurrentUser();
      this.currentUserSubject.next(user);
    } catch (err) {
      this.currentUserSubject.next(null);
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
      this.currentUserSubject.next(user);
      
      // After successful login, sync with your Express API
      await this.syncUserWithBackend();
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    try {
      await signOut();
      this.currentUserSubject.next(null);
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

  async syncUserWithBackend() {
    try {
      const token = await this.getIdToken();
      const user = await getCurrentUser();
      
      // Send user info to your Express API to create/update user profile
      return this.http.post(`${this.apiUrl}/users/sync`, {
        cognitoId: user.username,
        email: user.signInDetails?.loginId
      }, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }).toPromise();
    } catch (error) {
      throw error;
    }
  }

  // Method to make authenticated API calls
  async makeAuthenticatedRequest(endpoint: string, method: string = 'GET', data?: any): Promise<Observable<any>> {
    const token = await this.getIdToken();
    
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
}