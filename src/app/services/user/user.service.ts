import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  _id: string;
  name: string;
  email: string;
  userImage: string;
  role: string;
  active: boolean;
  wishlist: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://nile-brands.up.railway.app/api/v1';
  private staticUrl = 'https://nile-brands.up.railway.app';

  constructor(private http: HttpClient) { }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('user') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMe(): Observable<User> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/users/me`, { headers: this.authHeaders() }).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  updateMe(data: FormData): Observable<User> {
    return this.http.put<{ data: User }>(`${this.apiUrl}/users/updateMe`, data, { headers: this.authHeaders() }).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  changePassword(currentPassword: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/changeMyPassword`, { currentPassword, password, confirmPassword }, { headers: this.authHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  login(formData: { email: string; password: string }): Observable<{ token: string; data: User }> {
    return this.http.post<{ token: string; data: User }>(`${this.apiUrl}/auth/login`, formData);
  }

  signup(formData: { name: string; email: string; password: string; passwordConfirm: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/signup`, formData);
  }

  forgetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgetPassword`, { email });
  }

  verifyResetCode(resetCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/verifyCode`, { resetCode }, { headers: this.authHeaders() });
  }

  resetPassword(formData: { password: string; passwordConfirm: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/resetPassword`, formData, { headers: this.authHeaders() });
  }

  getUserImageUrl(raw: string): string {
    if (!raw) return '';
    if (raw.startsWith('http')) return raw;
    const filename = raw.replace(/^\/+/, '');
    return `${this.staticUrl}/users/${filename}`;
  }
}
