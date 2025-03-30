import { Injectable } from '@angular/core';
import { GlobalService } from '../global/global.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Signup } from '../../interfaces/auth';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private globalService: GlobalService,private Router:Router) {
    if (localStorage.getItem('user') !== null) {
      this.saveCurrentUser();
    }
  }

  currentUser = new BehaviorSubject<any>(null);

  saveCurrentUser() {
    const token: any = localStorage.getItem('user');
    this.currentUser.next(jwtDecode(token));
  }

  signup(formData: Signup): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/auth/signup`;
    return this.http.post<any>(url, formData);
  }
}
