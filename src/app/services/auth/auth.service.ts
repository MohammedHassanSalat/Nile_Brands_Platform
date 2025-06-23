import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login, resetPassword, Signup } from '../../interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {
    this.restoreUser();
  }

  currentUser = new BehaviorSubject<any>(null);
  private isRestored = new BehaviorSubject<boolean>(false);

  getToken(): string | null {
    return localStorage.getItem('user');
  }

  getLoggedUser(): Observable<any> {
    const url = `${environment.apiUrl}/users/me`;
    return this.http.get<any>(url, {
      headers: this.getAuthHeader()
    });
  }

  getAuthHeader(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  restoreUser(): Promise<void> {
    return new Promise((resolve) => {
      const token = this.getToken();
      if (token) {
        this.getLoggedUser().subscribe({
          next: (res) => {
            this.currentUser.next(res.data);
            this.isRestored.next(true);
            resolve();
          },
          error: () => {
            localStorage.removeItem('user');
            this.currentUser.next(null);
            this.isRestored.next(true);
            resolve();
          },
        });
      } else {
        this.isRestored.next(true);
        resolve();
      }
    });
  }

  isUserRestored(): Observable<boolean> {
    return this.isRestored.asObservable();
  }

  signup(formData: Signup): Observable<any> {
    const url = `${environment.apiUrl}/auth/signup`;
    return this.http.post<any>(url, formData);
  }

  login(formData: Login): Observable<any> {
    const url = `${environment.apiUrl}/auth/login`;
    return this.http.post<any>(url, formData);
  }

  forgetPassword(email: string): Observable<any> {
    const url = `${environment.apiUrl}/auth/forgetPassword`;
    return this.http.post<any>(url, { email });
  }

  verifyResetCode(resetCode: string): Observable<any> {
    const url = `${environment.apiUrl}/auth/verifyCode`;
    return this.http.post<any>(
      url,
      { resetCode },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('resetToken')}`
        }),
      }
    );
  }

  resetPassword(formData: resetPassword): Observable<any> {
    const url = `${environment.apiUrl}/auth/resetPassword`;
    return this.http.put<any>(url, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('resetToken')}`
      }),
    });
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.next(null);
  }
}