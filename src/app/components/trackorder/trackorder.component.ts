import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { OrderService } from '../../services/order/order.service';

@Component({
  selector: 'app-trackorder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trackorder.component.html',
  styleUrls: ['./trackorder.component.css']
})
export class TrackorderComponent implements OnInit {
  orderId!: string;
  currentStep = 0;

  steps = [
    {
      title: 'ORDER PENDING',
      description: 'Your order is currently being processed',
      image: 'images/images ui/orderone.png'
    },
    {
      title: 'ORDER SHIPPED',
      description: 'Your order has been shipped and is on its way!',
      image: 'images/images ui/ordertwo.png'
    },
    {
      title: 'ORDER DELIVERED',
      description: 'Your order has been successfully delivered!',
      image: 'images/images ui/orderthree.png'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id')!;
    this.orderService.trackOrder(this.orderId).subscribe({
      next: res => {
        this.mapStatusToStep(res.status);
      },
      error: () => {
        this.currentStep = 0; 
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  private mapStatusToStep(status: string): void {
    switch (status.toLowerCase()) {
      case 'pending':
        this.currentStep = 0;
        break;
      case 'shipped':
        this.currentStep = 1;
        break;
      case 'delivered':
        this.currentStep = 2;
        break;
      default:
        this.currentStep = 0;
    }
  }

  getStatusMessage(): string {
    switch (this.currentStep) {
      case 1:
        return 'Now Shipped';
      case 2:
        return 'Now Delivered';
      default:
        return '';
    }
  }
}