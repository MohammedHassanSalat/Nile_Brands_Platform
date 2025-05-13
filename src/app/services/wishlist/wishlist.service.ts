import { Injectable } from '@angular/core';
import { GlobalService } from '../global/global.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WishlistProduct } from '../../interfaces/wishlist';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private wishlistUrl: string;
  private wishlistSubject = new BehaviorSubject<WishlistProduct[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private global: GlobalService,
    private router: Router,
    private auth: AuthService
  ) {
    this.wishlistUrl = `${this.global.apiUrl}/api/v1/wishlist`;
  }

  loadWishlist(): void {
    const token = this.auth.getToken();
    this.loadingSubject.next(true);
    if (!token) {
      this.wishlistSubject.next([]);
      this.loadingSubject.next(false);
      return;
    }
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    this.http.get<{ data: WishlistProduct[] }>(this.wishlistUrl, { headers }).pipe(
      tap(res => this.wishlistSubject.next(res.data)),
      catchError(() => {
        this.wishlistSubject.next([]);
        return throwError(() => new Error('Failed to load wishlist'));
      })
    ).subscribe({
      next: () => this.loadingSubject.next(false),
      error: () => this.loadingSubject.next(false)
    });
  }

  getWishlist(): WishlistProduct[] {
    return this.wishlistSubject.getValue();
  }

  isInWishlist(product: WishlistProduct): boolean {
    const id = product.id || product._id;
    return this.getWishlist().some(p => (p.id || p._id) === id);
  }

  addToWishlist(product: WishlistProduct): Observable<any> {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
      return throwError(() => new Error('Not authenticated'));
    }
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    const payload = { product: product.id || product._id };
    return this.http.post<any>(this.wishlistUrl, payload, { headers }).pipe(
      tap(() => this.loadWishlist())
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    const token = this.auth.getToken();
    if (!token) {
      return throwError(() => new Error('Not authenticated'));
    }
    const headers = new HttpHeaders({ authorization: `Bearer ${token}` });
    return this.http.delete<any>(`${this.wishlistUrl}/${productId}`, { headers }).pipe(
      tap(() => {
        const updated = this.getWishlist().filter(p => (p.id || p._id) !== productId);
        this.wishlistSubject.next(updated);
      })
    );
  }

  toggleWishlist(product: WishlistProduct): void {
    const id = product.id || product._id;
    if (this.isInWishlist(product)) {
      this.removeFromWishlist(id).subscribe();
    } else {
      this.addToWishlist(product).subscribe();
    }
  }

  clearWishlist(): void {
    this.wishlistSubject.next([]);
    this.loadingSubject.next(false);
  }
}
