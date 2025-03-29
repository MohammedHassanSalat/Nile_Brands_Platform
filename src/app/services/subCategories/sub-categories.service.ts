import { Injectable } from '@angular/core';
import { GlobalService } from '../global/global.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubCategoriesService {
  constructor(private http: HttpClient, private globalService: GlobalService) {}

  // Fetch all subcategories.
  getAllSubcategories(): Observable<any> {
    const url = `${this.globalService.apiUrl}/subcategories?limit=9999`;
    return this.http.get<any>(url);
  }

  // Fetch products for a specific subcategory.
  getSubcategoryProducts(subcatId: string): Observable<any> {
    const url = `${this.globalService.apiUrl}/subcategories/${subcatId}`;
    return this.http.get<any>(url);
  }
}
