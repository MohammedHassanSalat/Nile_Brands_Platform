import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products/products.service';
import { GlobalService } from '../../services/global/global.service';
import { CategoriesService } from '../../services/categories/categories.service';
import { SubCategoriesService } from '../../services/subCategories/sub-categories.service';
import { WishlistService } from '../../services/wishlist/wishlist.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  home_page: string = 'images/images ui/home.png';
  logo = 'images/images ui/nile brand.png';
  products: any[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  selectedCategory: string = 'All';
  selectedSubcategory: string = 'All';
  filteredProducts: any[] = [];
  visibleProductsCount = 15;

  isLoading: boolean = true; 

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private globalService: GlobalService,
    private CategoriesService: CategoriesService,
    private SubCategoriesService: SubCategoriesService,
    public wishlistService: WishlistService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    Promise.all([
      this.CategoriesService.getCategories().toPromise(),
      this.productsService.getProducts().toPromise(),
      this.SubCategoriesService.getAllSubcategories().toPromise(),
    ])
      .then(([categoriesRes, productsRes, subcategoriesRes]) => {
        this.categories = [{ name: 'All', id: 'all-id' }, ...categoriesRes.data];
        this.products = productsRes.data || [];
        this.filteredProducts = [...this.products];
        this.subcategories = subcategoriesRes.data || [];
      })
      .catch((err) => {
        console.error('Error loading data:', err);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  filterCategory(category: any) {
    this.selectedCategory = category.name;
    this.selectedSubcategory = 'All';
    this.visibleProductsCount = 15;

    if (category.name === 'All') {
      this.filteredProducts = [...this.products];
      this.fetchAllSubcategories();
    } else {
      this.isLoading = true;

      Promise.all([
        this.CategoriesService.getCategoryProducts(category.id).toPromise(),
        this.CategoriesService.getCategorySubcategories(category.id).toPromise(),
      ])
        .then(([productsRes, subcategoriesRes]) => {
          this.filteredProducts = productsRes.data.products || [];
          this.subcategories = subcategoriesRes.data || [];
        })
        .catch((err) => {
          if (err.status === 404) {
            this.subcategories = [];
          }
          console.error('Error filtering category', err);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  filterSubcategory(subcat: any) {
    this.selectedSubcategory = subcat.name;
    this.visibleProductsCount = 15;

    if (subcat.name === 'All') {
      this.filterCategory({ name: this.selectedCategory, id: 'all-id' });
    } else {
      this.isLoading = true;

      this.SubCategoriesService.getSubcategoryProducts(subcat.id).subscribe({
        next: (response) => {
          this.filteredProducts = response.data.products || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching subcategory products', err);
          this.isLoading = false;
        },
      });
    }
  }

  fetchAllSubcategories() {
    this.SubCategoriesService.getAllSubcategories().subscribe({
      next: (response) => {
        this.subcategories = response.data || [];
      },
      error: (err) => console.error('Error fetching subcategories', err),
    });
  }

  getSubcategoriesForCategory(categoryName: string) {
    if (categoryName === 'All') return [];
    return this.subcategories.filter(
      (subcat) => subcat.category?.name.toLowerCase() === categoryName.toLowerCase()
    );
  }

  getProductsForSubcategory(subcatName: string): any[] {
    return this.filteredProducts
      .filter((p) => p.subcategory?.name === subcatName)
      .slice(0, this.visibleProductsCount);
  }

  seeMore() {
    this.visibleProductsCount += 15;
  }

  trackByProductId(index: number, product: any) {
    return product.id;
  }

  getProductImageUrl(product: any): string {
    if (product.coverImage && !product.coverImage.startsWith('http')) {
      return `${this.globalService.apiUrl}/products/${product.coverImage}`;
    }
    return product.coverImage;
  }

  isProductInWishlist(product: any): boolean {
    return this.wishlistService.isInWishlist(product);
  }

  toggleWishlistOrRedirect(product: any): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }

    this.wishlistService.toggleWishlist(product);
  }
}
