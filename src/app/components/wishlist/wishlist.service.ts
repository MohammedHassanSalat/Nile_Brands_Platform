import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlist: number[] = [];

  constructor() {}

  getWishlist(): number[] {
    return this.wishlist;
  }

  addToWishlist(productId: number) {
    if (!this.wishlist.includes(productId)) {
      this.wishlist.push(productId);
    }
  }

  removeFromWishlist(productId: number) {
    this.wishlist = this.wishlist.filter(id => id !== productId);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist.includes(productId);
  }

  toggleWishlist(productId: number) {
    if (this.isInWishlist(productId)) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(productId);
    }
  }
}
