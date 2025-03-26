import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  categories: any[] = [];
  subcategories: any[] = [];

  // API base URL
  apiUrl = 'https://nile-brands.up.railway.app/api/v1';
  selectedCategory: string = 'All';
  selectedSubcategory: string = 'All';
  filteredProducts: any[] = [];
  visibleProductsCount = 15;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchCategories();
    this.fetchProducts();
    this.fetchAllSubcategories();
  }

  // Fetch all categories.
  fetchCategories() {
    this.http.get<any>(`${this.apiUrl}/categories`).subscribe({
      next: (response) => {
        // Add an "All" option at the beginning.
        this.categories = [{ name: 'All', id: 'all-id' }, ...response.data];
      },
      error: (err) => {
        console.error('Error fetching categories', err);
      }
    });
  }

  // Fetch all products.
  fetchProducts() {
    this.http.get<any>(`${this.apiUrl}/products?limit=9999`).subscribe({
      next: (response) => {
        this.products = response.data || [];
        this.filteredProducts = [...this.products];
      },
      error: (err) => {
        console.error('Error fetching products', err);
      }
    });
  }

  // Fetch all subcategories (used when "All" category is selected).
  fetchAllSubcategories() {
    this.http.get<any>(`${this.apiUrl}/subcategories?limit=9999`).subscribe({
      next: (response) => {
        this.subcategories = response.data || [];
      },
      error: (err) => {
        console.error('Error fetching subcategories', err);
      }
    });
  }

  // Return subcategories for the given category name.
  getSubcategoriesForCategory(categoryName: string) {
    if (categoryName === 'All') {
      return [];
    }
    return this.subcategories.filter(
      (subcat) => subcat.category?.name.toLowerCase() === categoryName.toLowerCase()
    );
  }

  // Helper method to return filtered products for a given subcategory.
  getProductsForSubcategory(subcatName: string): any[] {
    return this.filteredProducts
      .filter(p => p.subcategory?.name === subcatName)
      .slice(0, this.visibleProductsCount);
  }

  // Called when a category is clicked.
  filterCategory(category: any) {
    this.selectedCategory = category.name;
    this.selectedSubcategory = 'All';
    this.visibleProductsCount = 15;

    if (category.name === 'All') {
      // Show all products and subcategories.
      this.filteredProducts = [...this.products];
      this.fetchAllSubcategories();
    } else {
      // Fetch category details (which include its products).
      this.http.get<any>(`${this.apiUrl}/categories/${category.id}`).subscribe({
        next: (response) => {
          this.filteredProducts = response.data.products || [];
        },
        error: (err) => {
          console.error('Error fetching category products', err);
        }
      });
      // Fetch subcategories for the selected category.
      this.http.get<any>(`${this.apiUrl}/categories/${category.id}/subcategories`).subscribe({
        next: (response) => {
          this.subcategories = response.data || [];
        },
        error: (err) => {
          console.error('Error fetching subcategories for category', err);
        }
      });
    }
  }

  // Called when a subcategory is clicked.
  filterSubcategory(subcat: any) {
    this.selectedSubcategory = subcat.name;
    this.visibleProductsCount = 15;

    if (subcat.name === 'All') {
      // Revert to showing all products for the selected category
      this.filterCategory({ name: this.selectedCategory, id: 'all-id' });
    } else {
      // Fetch only this subcategory's products
      this.http.get<any>(`${this.apiUrl}/subcategories/${subcat.id}`).subscribe({
        next: (response) => {
          this.filteredProducts = response.data.products || [];
        },
        error: (err) => {
          console.error('Error fetching subcategory products', err);
        }
      });
    }
  }

  seeMore() {
    this.visibleProductsCount += 15;
  }

  trackByProductId(index: number, product: any) {
    return product.id;
  }
}
