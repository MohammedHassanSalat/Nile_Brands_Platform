import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from '../global/global.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(private http: HttpClient, private globalService: GlobalService) {}

  // Fetch all categories.
  getCategories(): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/categories`;
    return this.http.get<any>(url);
  }

  // Fetch details of a category including its products.
  getCategoryProducts(categoryId: string): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/categories/${categoryId}`;
    return this.http.get<any>(url);
  }

  // Fetch subcategories for a given category.
  getCategorySubcategories(categoryId: string): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/categories/${categoryId}/subcategories`;
    return this.http.get<any>(url);
  }
}
