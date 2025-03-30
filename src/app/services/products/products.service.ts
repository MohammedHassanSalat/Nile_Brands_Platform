import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../global/global.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(
    private http: HttpClient,
    private globalService: GlobalService
  ) { }

  // Fetch all products.
  getProducts(): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/products?limit=9999`;
    return this.http.get<any>(url);
  }
}
