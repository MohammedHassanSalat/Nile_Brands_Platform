import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlist: any[] = [];

  constructor() {
    this.loadWishlistFromStorage();
  }

  private loadWishlistFromStorage() {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      this.wishlist = JSON.parse(stored);
    }
  }

  private saveWishlistToStorage() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }

  getWishlist() {
    return this.wishlist;
  }

  addToWishlist(product: any) {
    if (!this.isInWishlist(product.id)) {
      this.wishlist.push(product);
      this.saveWishlistToStorage();
    }
  }

  removeFromWishlist(productId: number) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.saveWishlistToStorage();
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist.some(item => item.id === productId);
  }

  toggleWishlist(product: any) {
    if (this.isInWishlist(product.id)) {
      this.removeFromWishlist(product.id);
    } else {
      this.addToWishlist(product);
    }
  }
}
