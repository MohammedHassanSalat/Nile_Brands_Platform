import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of, throwError } from 'rxjs';
import { map, mergeMap, timeout, catchError, tap } from 'rxjs/operators';
import { GlobalService } from '../global/global.service';
import { CartItem } from '../../interfaces/CartItem';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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
  private cartSubject = new BehaviorSubject<CartState>({ items: [], discountAmount: 0, totalPrice: 0, totalPriceAfterDiscount: 0 });
  public cart$ = this.cartSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private global: GlobalService,
    private router: Router,
    private auth: AuthService
  ) {
    this.apiUrl = this.global.apiUrl;
  }

  loadCart(): void {
    const token = this.auth.getToken();
    this.loadingSubject.next(true);
    if (!token) {
      this.cartSubject.next({ items: [], discountAmount: 0, totalPrice: 0, totalPriceAfterDiscount: 0 });
      this.loadingSubject.next(false);
      this.router.navigate(['/home']);
      return;
    }
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    this.http.get<{ data: { cartItems: CartItem[]; coupon?: { code: string }; totalPrice: number; totalPriceAfterDiscount: number } }>(
      `${this.apiUrl}/api/v1/carts`, { headers }
    ).pipe(
      timeout(15000),
      map(res => ({
        items: res.data.cartItems,
        couponCode: res.data.coupon?.code,
        discountAmount: res.data.totalPrice - res.data.totalPriceAfterDiscount,
        totalPrice: res.data.totalPrice,
        totalPriceAfterDiscount: res.data.totalPriceAfterDiscount
      })),
      mergeMap(state =>
        state.items.length
          ? this.processCartItems(state).pipe(map(items => ({ ...state, items })))
          : of(state)
      ),
      catchError(() => {
        this.cartSubject.next({ items: [], discountAmount: 0, totalPrice: 0, totalPriceAfterDiscount: 0 });
        this.loadingSubject.next(false);
        return throwError(() => new Error('Failed to load cart'));
      })
    ).subscribe(state => {
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
    return this.http.get<{ data: any }>(`${this.apiUrl}/api/v1/products/${item.product}`).pipe(
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

  addToCart(productId: string, quantity = 1): Observable<any> {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/home']);
      return throwError(() => new Error('Not authenticated'));
    }
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    return this.http.post(`${this.apiUrl}/api/v1/carts`, { product: productId, quantity }, { headers }).pipe(
      tap(() => this.loadCart())
    );
  }

  updateQuantity(itemId: string, quantity: number): Observable<any> {
    const token = this.auth.getToken();
    if (!token) return throwError(() => new Error('Not authenticated'));
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    return this.http.put(`${this.apiUrl}/api/v1/carts/${itemId}`, { quantity }, { headers }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeItem(itemId: string): Observable<any> {
    const token = this.auth.getToken();
    if (!token) return throwError(() => new Error('Not authenticated'));
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    return this.http.delete(`${this.apiUrl}/api/v1/carts/${itemId}`, { headers }).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart(): Observable<any> {
    const token = this.auth.getToken();
    if (!token) return throwError(() => new Error('Not authenticated'));
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    return this.http.delete(`${this.apiUrl}/api/v1/carts`, { headers }).pipe(
      tap(() => this.cartSubject.next({ items: [], discountAmount: 0, totalPrice: 0, totalPriceAfterDiscount: 0 }))
    );
  }

  applyCoupon(code: string): Observable<any> {
    const token = this.auth.getToken();
    if (!token) return throwError(() => new Error('Not authenticated'));
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    return this.http.put<{ data: { cartItems: CartItem[]; coupon?: { code: string }; totalPrice: number; totalPriceAfterDiscount: number } }>(
      `${this.apiUrl}/api/v1/carts/applyCoupon`, { code }, { headers }
    ).pipe(
      map(res => ({
        items: res.data.cartItems,
        couponCode: res.data.coupon?.code,
        discountAmount: res.data.totalPrice - res.data.totalPriceAfterDiscount,
        totalPrice: res.data.totalPrice,
        totalPriceAfterDiscount: res.data.totalPriceAfterDiscount
      })),
      tap(state => this.cartSubject.next(state))
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
