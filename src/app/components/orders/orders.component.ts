import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService, OrderResponse } from '../../services/order/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent implements OnInit {
  pastOrders: OrderResponse[] = [];
  loading = true;
  loadingMore = false;
  errorMsg = '';
  page = 1;
  limit = 15;
  pagination = { currentPage: 1, totalPages: 1, next: null as number | null };

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }
    this.loadOrders();
  }

  loadOrders(reset: boolean = true): void {
    if (reset) {
      this.page = 1;
      this.pastOrders = [];
      this.loading = true;
    } else {
      this.loadingMore = true;
    }
    this.orderService.getUserOrders(this.page, this.limit).subscribe({
      next: res => {
        const { data, pagination } = res;
        this.pastOrders = reset ? data : [...this.pastOrders, ...data];
        this.pagination = pagination;
        this.loading = false;
        this.loadingMore = false;
        this.cdr.markForCheck();
      },
      error: err => {
        this.errorMsg = err.error?.error?.message || 'Failed to load orders';
        this.loading = false;
        this.loadingMore = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadMore(): void {
    if (!this.pagination.next) return;
    this.page = this.pagination.next!;
    this.loadOrders(false);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  viewTracking(orderId: string): void {
    this.router.navigate(['/trackorder', orderId]);
  }
}
