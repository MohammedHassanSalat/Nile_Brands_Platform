import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-trackorder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trackorder.component.html',
  styleUrl: './trackorder.component.css',
})
export class TrackorderComponent {
  currentStep = 2;

  steps = [
    {
      title: 'ORDER PENDING',
      description: 'Your order is currently being processed',
      image: 'images/images ui/orderone.png',
    },
    {
      title: 'ORDER SHIPPED',
      description:
        'Your order has been shipped and is on its way! Estimated delivery time: 6 days',
      image: 'images/images ui/ordertwo.png',
    },
    {
      title: 'ORDER DELIVERED',
      description: 'Your order has been successfully delivered!',
      image: 'images/images ui/orderthree.png',
    },
  ];
}
