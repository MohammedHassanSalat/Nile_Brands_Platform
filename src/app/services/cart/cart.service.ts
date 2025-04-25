import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin, of } from 'rxjs';
import { tap, catchError, map, mergeMap, timeout, switchMap } from 'rxjs/operators';
import { GlobalService } from '../global/global.service';
import { CartItem, Product } from '../../interfaces/CartItem';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl: string;
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private global: GlobalService,
    private router: Router
  ) {
    this.apiUrl = this.global.apiUrl;
  }

  loadCart(): void {
    const token = localStorage.getItem('user');
    this.loadingSubject.next(true);

    if (!token) {
      this.handleAuthError();
      return;
    }

    this.http.get<{ data: { cartItems: CartItem[] } }>(`${this.apiUrl}/api/v1/carts`, {
      headers: { authorization: `Bearer ${token}` }
    }).pipe(
      timeout(15000),
      map(response => response.data.cartItems),
      mergeMap(items => this.processCartItems(items)),
      catchError(error => this.handleLoadError(error))
    ).subscribe({
      next: items => this.handleLoadSuccess(items),
      error: () => this.handleLoadError()
    });
  }

  private processCartItems(items: CartItem[]): Observable<CartItem[]> {
    const requests = items.map(item =>
      typeof item.product === 'string'
        ? this.fetchProductDetails(item)
        : of(item)
    );
    return forkJoin(requests);
  }

  private fetchProductDetails(item: CartItem): Observable<CartItem> {
    return this.http.get<{ data: any }>(
      `${this.apiUrl}/products/${item.product}`
    ).pipe(
      timeout(10000),
      map(resp => ({
        ...item,
        product: {
          ...resp.data,
          description: resp.data.description || 'No description',
          category: resp.data.category || { name: 'Uncategorized' },
          availableQuantity: resp.data.availableQuantity ?? 0
        }
      }))
    );
  }

  private handleLoadSuccess(items: CartItem[]): void {
    this.cartSubject.next(items);
    this.loadingSubject.next(false);
  }

  private handleLoadError(error?: any): Observable<never> {
    this.cartSubject.next([]);
    this.loadingSubject.next(false);
    return throwError(() => error || new Error('Cart load failed'));
  }

  private handleAuthError(): void {
    this.cartSubject.next([]);
    this.loadingSubject.next(false);
    this.router.navigate(['/home']);
  }

  addToCart(productId: string, quantity: number = 1): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.handleAuthError();
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http.post(`${this.apiUrl}/api/v1/carts`, { product: productId, quantity }, {
      headers: { authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.loadCart()),
      catchError(error => this.handleOperationError(error))
    );
  }

  updateQuantity(itemId: string, quantity: number): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.handleAuthError();
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http.put(`${this.apiUrl}/api/v1/carts/${itemId}`, { quantity }, {
      headers: { authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.loadCart()),
      catchError(error => this.handleOperationError(error))
    );
  }

  removeItem(itemId: string): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.handleAuthError();
      return throwError(() => new Error('Not authenticated'));
    }

    const currentItems = this.cartSubject.getValue();
    const isLastItem = currentItems.length === 1 && currentItems[0]._id === itemId;

    this.loadingSubject.next(true);

    return this.http.delete(`${this.apiUrl}/api/v1/carts/${itemId}`, {
      headers: { authorization: `Bearer ${token}` }
    }).pipe(
      switchMap(() => {
        if (isLastItem) {
          this.cartSubject.next([]);
          this.loadingSubject.next(false);
          return of(null);
        } else {
          this.loadCart();
          return of(null);
        }
      }),
      catchError(error => this.handleOperationError(error))
    );
  }

  clearCart(): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.handleAuthError();
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http.delete(`${this.apiUrl}/api/v1/carts`, {
      headers: { authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.cartSubject.next([])),
      catchError(error => this.handleOperationError(error))
    );
  }

  private handleOperationError(error: any): Observable<never> {
    this.loadingSubject.next(false);
    return throwError(() => error);
  }

  isInCart(productId: string): boolean {
    return this.cartSubject.getValue().some(item =>
      typeof item.product === 'string'
        ? item.product === productId
        : item.product._id === productId
    );
  }

  applyCoupon(couponCode: string): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.handleAuthError();
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http.put(
      `${this.apiUrl}/api/v1/carts/applyCoupon`,
      { name: couponCode },
      { headers: { authorization: `Bearer ${token}` } }
    ).pipe(
      catchError(err => this.handleOperationError(err))
    );
  }
}