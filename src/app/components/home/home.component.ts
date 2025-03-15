import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  home_page: string = 'images/images ui/home.png';
  products: any[] = [];
  filteredProducts: any[] = [];
  apiUrl = 'https://fakestoreapi.com/products';
  selectedCategory: string = 'All';
  visibleProductsCount = 10;

  constructor(
    private http: HttpClient,
    public wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.http.get<any[]>(this.apiUrl).subscribe((data) => {
      this.products = data;
      this.filteredProducts = [...this.products];
    });
  }

  filterCategory(category: string) {
    this.selectedCategory = category;
    this.filteredProducts = category === 'All'
      ? [...this.products]
      : this.products.filter(p => p.category === category);
    this.visibleProductsCount = 10;
  }

  toggleWishlist(product: any) {
    this.wishlistService.toggleWishlist(product);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  seeMore() {
    this.visibleProductsCount += 10;
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
