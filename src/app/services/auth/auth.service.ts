import { Injectable } from '@angular/core';
import { GlobalService } from '../global/global.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Login, Signup } from '../../interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private globalService: GlobalService) {
    this.restoreUser();
  }

  currentUser = new BehaviorSubject<any>(null);

  getLoggedUser(): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/users/me`;
    return this.http.get<any>(url, {
      headers: { authorization: `Bearer ${localStorage.getItem('user')}` },
    });
  }

  private restoreUser() {
    const token = localStorage.getItem('user');
    if (token) {
      this.getLoggedUser().subscribe({
        next: (res) => this.currentUser.next(res.data),
        error: (err) => {
          console.error('Failed to restore user:', err);
          localStorage.removeItem('user');
          this.currentUser.next(null);
        },
      });
    }
  }

  signup(formData: Signup): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/auth/signup`;
    return this.http.post<any>(url, formData);
  }

  login(formData: Login): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/auth/login`;
    return this.http.post<any>(url, formData);
  }
}
