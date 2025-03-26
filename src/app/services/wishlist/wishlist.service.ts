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
    const productId = Number(product.id);
    if (!this.isInWishlist(productId)) {
      const productToStore = { ...product, id: productId };
      this.wishlist.push(productToStore);
      this.saveWishlistToStorage();
    }
  }

  removeFromWishlist(productId: string | number) {
    const numericId = Number(productId);
    this.wishlist = this.wishlist.filter(item => Number(item.id) !== numericId);
    this.saveWishlistToStorage();
  }

  isInWishlist(productId: string | number): boolean {
    const numericId = Number(productId);
    return this.wishlist.some(item => Number(item.id) === numericId);
  }

  toggleWishlist(product: any) {
    const productId = Number(product.id);
    if (this.isInWishlist(productId)) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(product);
    }
  }
}
