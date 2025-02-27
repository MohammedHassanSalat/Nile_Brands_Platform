import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WishlistService } from '../wishlist/wishlist.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  home_page: string = 'images/images ui/home.png';
  products: any[] = [];
  filteredProducts: any[] = [];
  apiUrl = 'https://fakestoreapi.com/products';
  selectedCategory: string = 'All';
  visibleProductsCount = 10;

  constructor(private http: HttpClient, public wishlistService: WishlistService) {}

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
}
