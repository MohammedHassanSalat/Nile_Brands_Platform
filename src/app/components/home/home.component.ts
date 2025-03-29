import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products/products.service';
import { GlobalService } from '../../services/global/global.service';
import { CategoriesService } from '../../services/categories/categories.service';
import { SubCategoriesService } from '../../services/subCategories/sub-categories.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  home_page: string = 'images/images ui/home.png';
  products: any[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  selectedCategory: string = 'All';
  selectedSubcategory: string = 'All';
  filteredProducts: any[] = [];
  visibleProductsCount = 15;

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private globalService: GlobalService,
    private CategoriesService: CategoriesService,
    private SubCategoriesService: SubCategoriesService
  ) {}

  ngOnInit() {
    this.fetchCategories();
    this.fetchProducts();
    this.fetchAllSubcategories();
  }

  // Get categories
  fetchCategories() {
    this.CategoriesService.getCategories().subscribe({
      next: (response) => {
        this.categories = [{ name: 'All', id: 'all-id' }, ...response.data];
      },
      error: (err) => console.error('Error fetching categories', err),
    });
  }

  // Get all products
  fetchProducts() {
    this.productsService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data || [];
        this.filteredProducts = [...this.products];
      },
      error: (err) => console.error('Error fetching products', err),
    });
  }

  // Get all subcategories.
  fetchAllSubcategories() {
    this.SubCategoriesService.getAllSubcategories().subscribe({
      next: (response) => {
        this.subcategories = response.data || [];
      },
      error: (err) => console.error('Error fetching subcategories', err),
    });
  }

  // Filter subcategories for a given category.
  getSubcategoriesForCategory(categoryName: string) {
    if (categoryName === 'All') {
      return [];
    }
    return this.subcategories.filter(
      (subcat) =>
        subcat.category?.name.toLowerCase() === categoryName.toLowerCase()
    );
  }

  // Return products for a subcategory with a limit.
  getProductsForSubcategory(subcatName: string): any[] {
    return this.filteredProducts
      .filter((p) => p.subcategory?.name === subcatName)
      .slice(0, this.visibleProductsCount);
  }

  // When a category is clicked, update filteredProducts and subcategories.
  filterCategory(category: any) {
    this.selectedCategory = category.name;
    this.selectedSubcategory = 'All';
    this.visibleProductsCount = 15;

    if (category.name === 'All') {
      this.filteredProducts = [...this.products];
      this.fetchAllSubcategories();
    } else {
      // Get products associated with this category.
      this.CategoriesService.getCategoryProducts(category.id).subscribe({
        next: (response) => {
          this.filteredProducts = response.data.products || [];
        },
        error: (err) => console.error('Error fetching category products', err),
      });
      // Get subcategories for this category.
      this.CategoriesService.getCategorySubcategories(category.id).subscribe({
        next: (response) => {
          this.subcategories = response.data || [];
        },
        error: (err) => {
          if (err.status === 404) {
            console.error('Subcategories not found for this category.', err);
            this.subcategories = [];
          } else {
            console.error('Error fetching subcategories for category', err);
          }
        },
      });
    }
  }

  // When a subcategory is clicked, update the filtered products.
  filterSubcategory(subcat: any) {
    this.selectedSubcategory = subcat.name;
    this.visibleProductsCount = 15;

    if (subcat.name === 'All') {
      this.filterCategory({ name: this.selectedCategory, id: 'all-id' });
    } else {
      this.SubCategoriesService.getSubcategoryProducts(subcat.id).subscribe({
        next: (response) => {
          this.filteredProducts = response.data.products || [];
        },
        error: (err) =>
          console.error('Error fetching subcategory products', err),
      });
    }
  }

  // Load more products by increasing the count.
  seeMore() {
    this.visibleProductsCount += 15;
  }
  trackByProductId(index: number, product: any) {
    return product.id;
  }
  getProductImageUrl(product: any): string {
    if (product.coverImage && !product.coverImage.startsWith('http')) {
      return `https://nile-brands.up.railway.app/products/${product.coverImage}`;
    }
    return product.coverImage;
  }
}
