import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-productdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css',
})
export class ProductdetailsComponent {
  product = {
    title: 'Black dress',
    description:
      'Elegant black dress featuring a sleek silhouette, designed with premium fabric.',
    rating: 3, // out of 5
    sizes: [38, 39, 40, 41, 42],
    price: 700,
  };

  productImages = [
    'images/images ui/orderone.png',
    'images/images ui/ordertwo.png',
    'images/images ui/orderthree.png',
    'images/images ui/authnilebrand.png',
  ];

  selectedImage = this.productImages[0];
  selectedSize: number | null = null;

  rating: number = 3;
  stars = Array(5).fill(0);
}
