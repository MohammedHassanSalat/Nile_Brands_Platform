import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin, of } from 'rxjs';
import { tap, catchError, map, mergeMap, timeout, switchMap } from 'rxjs/operators';
import { GlobalService } from '../global/global.service';
import { CartItem } from '../../interfaces/CartItem';
import { Router } from '@angular/router';

export interface CartState {
  items: CartItem[];
  couponCode?: string;
  discountAmount: number;
  totalPrice: number;
  totalPriceAfterDiscount: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl: string;
  private cartSubject = new BehaviorSubject<CartState>({
    items: [],
    couponCode: undefined,
    discountAmount: 0,
    totalPrice: 0,
    totalPriceAfterDiscount: 0
  });
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
      this.cartSubject.next({ items: [], discountAmount: 0, totalPrice: 0, totalPriceAfterDiscount: 0 });
      this.loadingSubject.next(false);
      this.router.navigate(['/home']);
      return;
    }
    this.http
      .get<{
        data: {
          cartItems: CartItem[];
          coupon?: { code: string };
          totalPrice: number;
          totalPriceAfterDiscount: number;
        };
      }>(`${this.apiUrl}/api/v1/carts`, {
        headers: { authorization: `Bearer ${token}` }
      })
      .pipe(
        timeout(15000),
        map(response => ({
          items: response.data.cartItems,
          couponCode: response.data.coupon?.code,
          discountAmount: response.data.totalPrice - response.data.totalPriceAfterDiscount,
          totalPrice: response.data.totalPrice,
          totalPriceAfterDiscount: response.data.totalPriceAfterDiscount
        })),
        mergeMap(state =>
          state.items.length
            ? this.processCartItems(state).pipe(map(processed => ({ ...state, items: processed })))
            : of(state)
        ),
        catchError(error => {
          this.cartSubject.next({ items: [], discountAmount: 0, totalPrice: 0, totalPriceAfterDiscount: 0 });
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      )
      .subscribe(state => {
        this.cartSubject.next(state);
        this.loadingSubject.next(false);
      });
  }

  private processCartItems(state: CartState): Observable<CartItem[]> {
    const requests = state.items.map(item =>
      typeof item.product === 'string'
        ? this.fetchProductDetails(item)
        : of(item)
    );
    return forkJoin(requests);
  }

  private fetchProductDetails(item: CartItem): Observable<CartItem> {
    return this.http
      .get<{ data: any }>(`${this.apiUrl}/products/${item.product}`)
      .pipe(
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

  addToCart(productId: string, quantity: number = 1): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.cartSubject.next({ items: [], discountAmount: 0, totalPrice: 0, totalPriceAfterDiscount: 0 });
      this.loadingSubject.next(false);
      this.router.navigate(['/home']);
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http
      .post(`${this.apiUrl}/api/v1/carts`, { product: productId, quantity }, { headers: { authorization: `Bearer ${token}` } })
      .pipe(
        tap(() => this.loadCart()),
        catchError(err => throwError(() => err))
      );
  }

  updateQuantity(itemId: string, quantity: number): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/home']);
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http
      .put(`${this.apiUrl}/api/v1/carts/${itemId}`, { quantity }, { headers: { authorization: `Bearer ${token}` } })
      .pipe(
        tap(() => this.loadCart()),
        catchError(err => throwError(() => err))
      );
  }

  removeItem(itemId: string): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/home']);
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http
      .delete(`${this.apiUrl}/api/v1/carts/${itemId}`, { headers: { authorization: `Bearer ${token}` } })
      .pipe(
        tap(() => this.loadCart()),
        catchError(err => throwError(() => err))
      );
  }

  clearCart(): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/home']);
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http
      .delete(`${this.apiUrl}/api/v1/carts`, { headers: { authorization: `Bearer ${token}` } })
      .pipe(
        tap(() => {
          this.cartSubject.next({ items: [], discountAmount: 0, totalPrice: 0, totalPriceAfterDiscount: 0 });
        }),
        catchError(err => throwError(() => err))
      );
  }

  applyCoupon(code: string): Observable<any> {
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/home']);
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http
      .put<{
        data: {
          cartItems: CartItem[];
          coupon?: { code: string };
          totalPrice: number;
          totalPriceAfterDiscount: number;
        };
      }>(`${this.apiUrl}/api/v1/carts/applyCoupon`, { name: code }, { headers: { authorization: `Bearer ${token}` } })
      .pipe(
        map(response => ({
          items: response.data.cartItems,
          couponCode: response.data.coupon?.code,
          discountAmount: response.data.totalPrice - response.data.totalPriceAfterDiscount,
          totalPrice: response.data.totalPrice,
          totalPriceAfterDiscount: response.data.totalPriceAfterDiscount
        })),
        tap(state => this.cartSubject.next(state)),
        catchError(err => throwError(() => err))
      );
  }

  isInCart(productId: string): boolean {
    return this.cartSubject.getValue().items.some(item =>
      typeof item.product === 'string'
        ? item.product === productId
        : item.product._id === productId
    );
  }
}