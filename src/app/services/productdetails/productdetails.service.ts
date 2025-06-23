import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../global/global.service';
import { Observable, map } from 'rxjs';
import { Product } from '../../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private http: HttpClient, private globalService: GlobalService) { }

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

  getRelatedProducts(currentProductId: string, categoryName: string): Observable<Product[]> {
    return this.http.get<{ data: Product[] }>(`${this.globalService.apiUrl}/api/v1/products`).pipe(
      map(response => {
        const products = response.data.filter(p =>
          p.category.name === categoryName && p._id !== currentProductId
        );
        return this.shuffleArray(products).slice(0, 4);
      }),
      map(products => products.map(p => this.mapProduct(p)))
    );
  }

  private mapProduct(product: Product): Product {
    return {
      ...product,
      id: product.id || product._id,
      coverImage: product.coverImage ? this.getProductImageUrl(product.coverImage) : 'images/images ui/nile brand.png',
      images: product.images?.map(img => this.getProductImageUrl(img)) || []
    };
  }

  private shuffleArray(array: Product[]): Product[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getProductImageUrl(image: string): string {
    if (!image) return 'images/images ui/authnilebrand.png';
    if (image.startsWith('http')) return image;
    return `${this.globalService.apiUrl}/products/${image}`;
  }

  createReview(productId: string, reviewData: { rating: number; comment: string }): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/products/${productId}/reviews`;
    return this.http.post<{ data: any }>(url, reviewData, {
      headers: { authorization: `Bearer ${localStorage.getItem('user')}` }
    });
  }

  updateReview(productId: string, reviewId: string, reviewData: any): Observable<any> {
    return this.http.put<{ data: any }>(
      `${this.globalService.apiUrl}/api/v1/products/${productId}/reviews/${reviewId}`,
      reviewData,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('user')}`
        }
      }
    );
  }

  deleteReview(productId: string, reviewId: string): Observable<any> {
    const url = `${this.globalService.apiUrl}/api/v1/products/${productId}/reviews/${reviewId}`;
    return this.http.delete(url, {
      headers: { authorization: `Bearer ${localStorage.getItem('user')}` }
    });
  }

  getProductReviews(productId: string): Observable<any[]> {
    const url = `${this.globalService.apiUrl}/api/v1/products/${productId}/reviews`;
    return this.http.get<any>(url, {
      headers: { authorization: `Bearer ${localStorage.getItem('user')}` }
    }).pipe(map(response => response.data));
  }
}