import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { WishlistProduct } from '../../interfaces/wishlist';
import { CartService } from '../../services/cart/cart.service';
import { GlobalService } from '../../services/global/global.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  empty_wishlist = 'images/images ui/empty wishlist.svg';
  logo = 'images/images ui/nile brand.png';
  wishlist: WishlistProduct[] = [];
  loading = true;

  constructor(
    public wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router,
    private globalService: GlobalService
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }

    this.wishlistService.wishlist$.subscribe(products => {
      this.wishlist = products;
    });
    this.wishlistService.loading$.subscribe(isLoading => {
      this.loading = isLoading;
    });

    this.wishlistService.loadWishlist();
  }

  getWishlistImageUrl(product: WishlistProduct): string {
    const img = product.coverImage;
    return img && !img.startsWith('http')
      ? `${this.globalService.apiUrl}/products/${img}`
      : img;
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.wishlistService.loadWishlist();
      },
      error: err => console.error('Error removing from wishlist', err)
    });
  }

  onAddToCart(product: WishlistProduct): void {
    this.cartService.addItem({
      name: product.name,
      description: product.description,
      image: product.coverImage,
      price: product.price,
      quantity: 1
    });
    this.router.navigate(['/cart']);
  }

  onAddToWishlist(product: WishlistProduct): void {
    if (this.wishlistService.isInWishlist(product)) {
      this.wishlistService.removeFromWishlist(product.id || product._id).subscribe({
        next: () => {
          console.log(`Removed ${product._id} from wishlist`);
          this.wishlistService.loadWishlist();
        },
        error: err => console.error('Error removing from wishlist', err)
      });
    } else {
      this.wishlistService.addToWishlist(product).subscribe({
        next: () => {
          console.log(`Added ${product._id} to wishlist`);
          this.wishlistService.loadWishlist();
        },
        error: err => console.error('Error adding to wishlist', err)
      });
    }
  }
}
