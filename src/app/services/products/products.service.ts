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

  // Fetch all categories.
  getCategories(): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/categories`;
    console.log('Fetching categories from:', url);
    return this.http.get<any>(url);
  }

  // Fetch all products.
  getProducts(): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/products?limit=9999`;
    console.log('Fetching products from:', url);
    return this.http.get<any>(url);
  }

  // Fetch all subcategories.
  getAllSubcategories(): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/subcategories?limit=9999`;
    console.log('Fetching all subcategories from:', url);
    return this.http.get<any>(url);
  }

  // Fetch details of a category including its products.
  getCategoryProducts(categoryId: string): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/categories/${categoryId}`;
    console.log('Fetching category products from:', url);
    return this.http.get<any>(url);
  }

  // Fetch subcategories for a given category.
  getCategorySubcategories(categoryId: string): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/categories/${categoryId}/subcategories`;
    console.log('Fetching category subcategories from:', url);
    return this.http.get<any>(url);
  }

  // Fetch products for a specific subcategory.
  getSubcategoryProducts(subcatId: string): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/subcategories/${subcatId}`;
    console.log('Fetching subcategory products from:', url);
    return this.http.get<any>(url);
  }
}
