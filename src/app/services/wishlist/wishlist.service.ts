import { Injectable } from '@angular/core'
import { GlobalService } from '../global/global.service'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Router } from '@angular/router'
import { WishlistProduct } from '../../interfaces/wishlist'

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistUrl: string
  private wishlistSubject = new BehaviorSubject<WishlistProduct[]>([])
  public wishlist$ = this.wishlistSubject.asObservable()
  private loadingSubject = new BehaviorSubject<boolean>(false)
  public loading$ = this.loadingSubject.asObservable()

  constructor(
    private http: HttpClient,
    private global: GlobalService,
    private router: Router
  ) {
    this.wishlistUrl = `${this.global.apiUrl}/api/v1/wishlist`
  }

  loadWishlist(): void {
    const token = localStorage.getItem('user')
    this.loadingSubject.next(true)
    if (!token) {
      this.wishlistSubject.next([])
      this.loadingSubject.next(false)
      return
    }
    this.http.get<{ data: WishlistProduct[] }>(this.wishlistUrl, {
      headers: { authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => {
        this.wishlistSubject.next(res.data)
        this.loadingSubject.next(false)
      },
      error: () => {
        this.wishlistSubject.next([])
        this.loadingSubject.next(false)
      }
    })
  }

  getWishlist(): WishlistProduct[] {
    return this.wishlistSubject.getValue()
  }

  isInWishlist(product: WishlistProduct): boolean {
    return this.getWishlist().some(p => (p.id || p._id) === (product.id || product._id))
  }

  addToWishlist(product: WishlistProduct): Observable<any> {
    const token = localStorage.getItem('user')
    if (!token) {
      this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } })
      return throwError(() => new Error('Not authenticated'))
    }
    const payload = { product: product.id || product._id }
    return this.http.post<any>(this.wishlistUrl, payload, {
      headers: { authorization: `Bearer ${token}` }
    }).pipe(tap(() => this.loadWishlist()))
  }

  removeFromWishlist(productId: string): Observable<any> {
    const token = localStorage.getItem('user')
    return this.http.delete<any>(`${this.wishlistUrl}/${productId}`, {
      headers: { authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => {
        const current = this.wishlistSubject.getValue()
        this.wishlistSubject.next(current.filter(p => (p.id || p._id) !== productId))
      })
    )
  }

  toggleWishlist(product: WishlistProduct): void {
    const productId = product.id || product._id
    if (this.isInWishlist(product)) {
      this.removeFromWishlist(productId).subscribe()
    } else {
      this.addToWishlist(product).subscribe()
    }
  }

  clearWishlist(): void {
    this.wishlistSubject.next([])
    this.loadingSubject.next(false)
  }
}
