import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../../services/global/global.service';
import { CartService, CartState } from '../../services/cart/cart.service';
import { CartItem, Product } from '../../interfaces/CartItem';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  pay_1 = 'images/images ui/pay 1.png';
  pay_2 = 'images/images ui/pay 2.png';
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
  private errorTimeout: any;
  paymentInfo = {
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardholderName: '',
    country: 'Egypt',
    zip: ''
  };

  constructor(
    private router: Router,
    public cartService: CartService,
    private globalService: GlobalService,
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
    const originalQuantity = item.quantity;
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
        item.quantity = originalQuantity;
        this.isUpdatingQuantity = false;
        this.quantityError = err.error?.error?.message || 'Failed to update quantity';
        this.errorTimeout = setTimeout(() => {
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
      next: () => { },
      error: err => {
        item.quantity = original;
        this.quantityError = err.error?.error?.message || 'Failed to update quantity';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.quantityError = '';
          this.cdr.markForCheck();
        }, 5000);
      }
    });
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity <= 1) return;
    const original = item.quantity;
    item.quantity--;
    this.cdr.markForCheck();
    this.cartService.updateQuantity(item._id, item.quantity).subscribe({
      next: () => { },
      error: err => {
        item.quantity = original;
        this.quantityError = err.error?.error?.message || 'Failed to update quantity';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.quantityError = '';
          this.cdr.markForCheck();
        }, 5000);
      }
    });
  }

  applyCoupon(): void {
    this.couponError = '';
    this.couponApplied = false;
    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: () => {
        this.couponApplied = true;
        this.cdr.markForCheck();
      },
      error: err => {
        this.couponApplied = false;
        this.discountAmount = 0;
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
    if (this.validatePayment()) {
      this.router.navigate(['/cart'], {
        state: {
          paymentInfo: this.paymentInfo,
          totalAmount: this.getTotal()
        }
      });
    }
  }

  private validatePayment(): boolean {
    const e = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.paymentInfo.email);
    const c = this.paymentInfo.cardNumber.replace(/\s/g, '').length === 16;
    const x = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(this.paymentInfo.expiry);
    const v = /^\d{3,4}$/.test(this.paymentInfo.cvc);
    return e && c && x && v && !!this.paymentInfo.cardholderName && !!this.paymentInfo.zip;
  }
}
