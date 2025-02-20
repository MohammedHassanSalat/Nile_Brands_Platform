import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { WishlistService } from './wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,  // Ensure this is a standalone component
  imports: [CommonModule],  // Add CommonModule
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
  constructor(public wishlistService: WishlistService) {}

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId);
  }
}
