import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  // API base URL
  apiUrl = 'https://nile-brands.up.railway.app';

  constructor() { }
  isUserLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
