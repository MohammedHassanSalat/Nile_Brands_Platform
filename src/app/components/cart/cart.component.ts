import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../../services/global/global.service';
import { CartService, CartState } from '../../services/cart/cart.service';
import { CartItem, Product } from '../../interfaces/CartItem';
import { OrderService } from '../../services/order/order.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  loading = true;
  cartItems: CartItem[] = [];
  couponCode = '';
  couponError = '';
  couponApplied = false;
  shippingCost = 0;
  discountAmount = 0;
  isUpdatingQuantity = false;
  quantityError = '';
  itemError = '';
  private errorTimeout: number = 0;
  address = '';
  pastOrders: any[] = [];

  constructor(
    private router: Router,
    public cartService: CartService,
    private globalService: GlobalService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }

    this.cartService.cart$.subscribe((state: CartState) => {
      if (this.loading) this.loading = false;
      this.cartItems = state.items;
      this.couponCode = state.couponCode || '';
      this.discountAmount = state.discountAmount || 0;
      this.cdr.markForCheck();
    });
    this.cartService.loadCart();

    this.orderService.getUserOrders().subscribe(response => {
      this.pastOrders = response.data || [];
      this.cdr.markForCheck();
    });
  }

  trackById(index: number, item: CartItem): string {
    return item._id;
  }

  getProduct(item: CartItem): Product | null {
    return typeof item.product === 'object' ? item.product : null;
  }

  getImageUrl(image: string): string {
    return image.startsWith('http')
      ? image
      : `${this.globalService.apiUrl}/products/${image}`;
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe();
  }

  removeAll(): void {
    if (confirm('Clear cart?')) {
      this.cartService.clearCart().subscribe();
    }
  }

  updateQuantity(item: CartItem): void {
    clearTimeout(this.errorTimeout);
    const original = item.quantity;
    this.isUpdatingQuantity = true;
    this.itemError = item._id;
    this.couponApplied = false;
    this.couponError = '';
    this.discountAmount = 0;
    this.cdr.markForCheck();
    this.cartService.updateQuantity(item._id, item.quantity).subscribe({
      next: () => {
        this.isUpdatingQuantity = false;
        this.quantityError = '';
        this.cdr.markForCheck();
      },
      error: err => {
        item.quantity = original;
        this.isUpdatingQuantity = false;
        this.quantityError = err.error?.error?.message || 'Failed to update quantity';
        this.errorTimeout = window.setTimeout(() => {
          this.quantityError = '';
          this.cdr.markForCheck();
        }, 5000);
        this.cdr.markForCheck();
      }
    });
  }

  incrementQuantity(item: CartItem): void {
    const original = item.quantity;
    item.quantity++;
    this.cdr.markForCheck();
    this.cartService.updateQuantity(item._id, item.quantity).subscribe({
      error: () => {
        item.quantity = original;
        this.cdr.markForCheck();
      }
    });
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity <= 1) return;
    const original = item.quantity;
    item.quantity--;
    this.cdr.markForCheck();
    this.cartService.updateQuantity(item._id, item.quantity).subscribe({
      error: () => {
        item.quantity = original;
        this.cdr.markForCheck();
      }
    });
  }

  private checkDifferentBrands(): boolean {
    const brandIds = this.cartItems
      .map(i => this.getProduct(i)?.brand?._id)
      .filter(id => !!id) as string[];
    return new Set<string>(brandIds).size > 1;
  }

  applyCoupon(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (this.checkDifferentBrands()) {
      alert('Coupons only apply when all products are from the same brand.');
      return;
    }
    this.couponError = '';
    this.couponApplied = false;
    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: () => {
        this.couponApplied = true;
        this.discountAmount = this.cartService['cartSubject'].getValue().discountAmount;
        this.cdr.markForCheck();
      },
      error: err => {
        this.couponError = err.error?.error?.message || 'Failed to apply coupon';
        this.cdr.markForCheck();
      }
    });
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  getTotal(): number {
    return this.getSubtotal() + this.shippingCost - this.discountAmount;
  }

  onCheckout(): void {
    if (!this.address.trim()) {
      alert('Please enter a shipping address');
      return;
    }
    this.orderService.createOrder({ address: this.address }).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err: HttpErrorResponse) => {
        console.error('Order creation error:', err);
        const msg = err.error?.error?.message || err.error?.message || err.message || 'Order creation failed';
        alert(msg);
      }
    });
  }
}
