import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartItem, CartService } from '../../services/cart/cart.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  pay_1: string = 'images/images ui/pay 1.png';
  pay_2: string = 'images/images ui/pay 2.png';
  pay_3: string = 'images/images ui/pay 3.png';
  pay_4: string = 'images/images ui/pay 4.png';
  cartItems: CartItem[] = [];
  private subscription!: Subscription;
  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.subscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeItem(index: number): void {
    this.cartService.removeItem(index);
  }

  removeAll(): void {
    // Clear the cart by emitting an empty array.
    this.cartService.clearCart();
  }

  // Compute subtotal from cart items.
  getSubtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  // Total: Subtotal minus Savings plus Store Pickup fee plus Tax.
  getTotal(): number {
    return this.getSubtotal();
  }

  /**
   * Called when the user clicks the "Pay" button.
   */
  onCheckout(): void {
    const total = this.getTotal();
    alert(`Thank you for your purchase of ${total.toFixed(2)} LE!`);
    // Optionally clear the cart or form here.
  }

  decrementQuantity(item: CartItem): void {
    item.quantity = Math.max(item.quantity - 1, 1);
    // Re-emit the updated cart to trigger UI changes.
    this.cartService.updateCartItems();
  }

  incrementQuantity(item: CartItem): void {
    item.quantity++;
    // Re-emit the updated cart.
    this.cartService.updateCartItems();
  }

  clearCheckoutForm(): void {
    console.log('Checkout form cleared!');
    // Reset form fields if necessary.
  }
}
