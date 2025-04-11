import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../global/global.service';
import { Observable, map } from 'rxjs';

export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  colors: string[];
  sizes: string[];
  price: number;
  quantity: number;
  sold: number;
  ratingAverage: number;
  ratingCount: number;
  coverImage?: string;
  images: string[];
  brand: {
    name: string;
    owner?: {
      name: string;
    };
  };
  category: {
    name: string;
  };
  subcategory: {
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(
    private http: HttpClient,
    private globalService: GlobalService
  ) { }

  getProductById(id: string): Observable<Product> {
    const url = `${this.globalService.apiUrl}/api/v1/products/${id}`;
    return this.http.get<{ data: Product }>(url).pipe(
      map(response => ({
        ...response.data,
        id: response.data.id || response.data._id,
        colors: response.data.colors || [],
        sizes: response.data.sizes || []
      }))
    );
  }

  getProductImageUrl(image: string): string {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${this.globalService.apiUrl}/products/${image}`;
  }
}