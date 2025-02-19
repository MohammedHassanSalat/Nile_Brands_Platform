import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  image2Path: string = 'images/images ui/home page.svg';
  products: any[] = [];
  filteredProducts: any[] = [];
  apiUrl = 'https://fakestoreapi.com/products';
  selectedCategory: string = 'All';

  constructor(private http: HttpClient) {}

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
  }
}
