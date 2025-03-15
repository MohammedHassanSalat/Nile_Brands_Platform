import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  name: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
  classification?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }

  addItem(item: CartItem): void {
    const items = this.getCartItems();
    const existing = items.find(ci => ci.name === item.name);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push(item);
    }
    this.cartItemsSubject.next([...items]);
  }

  removeItem(index: number): void {
    const items = this.getCartItems();
    items.splice(index, 1);
    this.cartItemsSubject.next([...items]);
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
  }

  // NEW: Re-emit the current cart items to trigger updates
  updateCartItems(): void {
    this.cartItemsSubject.next([...this.getCartItems()]);
  }
}
