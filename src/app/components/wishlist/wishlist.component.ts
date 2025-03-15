import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { CartService } from '../../services/cart/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  empty_wishlist: string = 'images/images ui/empty wishlist.svg';
  wishlist: any[] = [];

  constructor(
    public wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.wishlist = this.wishlistService.getWishlist();
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId);
    this.loadWishlist(); 
  }

  onAddToCart(product: any) {
    const cartItem = {
      name: product.title,
      description: product.description,
      image: product.image,
      price: product.price,
      quantity: 1
    };
    this.cartService.addItem(cartItem);
    this.router.navigate(['/cart']);
  }
}
