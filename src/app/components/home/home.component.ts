import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ProductsService } from '../../services/products/products.service';
import { GlobalService } from '../../services/global/global.service';
import { CategoriesService } from '../../services/categories/categories.service';
import { SubCategoriesService } from '../../services/subCategories/sub-categories.service';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { CartService } from '../../services/cart/cart.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  home_page = 'images/images ui/home.png';
  logo = 'images/images ui/nile brand.png';
  products: any[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  selectedCategory = 'All';
  selectedSubcategory = 'All';
  filteredProducts: any[] = [];
  visibleProductsCount = 15;
  isLoading = true;
  isLoggedIn = false;

  private searchTerm = '';
  private search$ = new Subject<string>();

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    private globalService: GlobalService,
    private CategoriesService: CategoriesService,
    private SubCategoriesService: SubCategoriesService,
    public wishlistService: WishlistService,
    public cartService: CartService
  ) {}

  ngOnInit() {
    this.cartService.loadCart();
    this.wishlistService.loadWishlist();
    this.isLoggedIn = !!localStorage.getItem('user');
    this.route.queryParams
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a: Params, b: Params) => a['search'] === b['search'])
      )
      .subscribe(params => {
        this.searchTerm = (params['search'] || '').trim().toLowerCase();
        this.applyFilters();
      });
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(term => {
        this.router.navigate(['/home'], { queryParams: { search: term || null } });
      });
    this.loadData();
  }

  onSearchInput(value: string) {
    this.search$.next(value);
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
        this.subcategories = subcategoriesRes.data || [];
        this.applyFilters();
      })
      .catch(err => console.error('Error loading data:', err))
      .finally(() => (this.isLoading = false));
  }

  filterCategory(category: any) {
    this.selectedCategory = category.name;
    this.selectedSubcategory = 'All';
    this.visibleProductsCount = 15;
    this.applyFilters();
  }

  filterSubcategory(subcat: any) {
    this.selectedSubcategory = subcat.name;
    this.visibleProductsCount = 15;
    this.applyFilters();
  }

  private applyFilters() {
    let tmp = [...this.products];
    if (this.selectedCategory !== 'All') {
      tmp = tmp.filter(p => p.category?.name === this.selectedCategory);
    }
    if (this.selectedSubcategory !== 'All') {
      tmp = tmp.filter(p => p.subcategory?.name === this.selectedSubcategory);
    }
    if (this.searchTerm) {
      tmp = tmp.filter(
        p =>
          p.name.toLowerCase().includes(this.searchTerm) ||
          p.description.toLowerCase().includes(this.searchTerm)
      );
    }
    this.filteredProducts = tmp;
  }

  fetchAllSubcategories() {
    this.SubCategoriesService.getAllSubcategories().subscribe({
      next: resp => (this.subcategories = resp.data || []),
      error: err => console.error('Error fetching subcategories', err),
    });
  }

  getSubcategoriesForCategory(categoryName: string) {
    if (categoryName === 'All') return [];
    return this.subcategories.filter(
      sc => sc.category?.name.toLowerCase() === categoryName.toLowerCase()
    );
  }

  getDisplayedProducts(): any[] {
    return this.filteredProducts.slice(0, this.visibleProductsCount);
  }

  getProductsForSubcategory(subcatName: string): any[] {
    return this.filteredProducts
      .filter(p => p.subcategory?.name === subcatName)
      .slice(0, this.visibleProductsCount);
  }

  seeMore() {
    this.visibleProductsCount += 15;
  }

  trackByProductId(_: number, product: any) {
    return product.id;
  }

  getProductImageUrl(product: any): string {
    if (product.coverImage && !product.coverImage.startsWith('http')) {
      return `${this.globalService.apiUrl}/products/${product.coverImage}`;
    }
    return product.coverImage;
  }

  toggleWishlistOrRedirect(product: any): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/signin']);
      return;
    }
    this.wishlistService.toggleWishlist(product);
  }

  toggleCartOrRedirect(product: any): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/signin']);
      return;
    }
    if (this.cartService.isInCart(product.id)) {
      this.cartService.removeItem(product.id).subscribe();
    } else {
      this.cartService.addToCart(product.id).subscribe();
    }
  }

  viewDetails(product: any): void {
    this.router.navigate(['/products', product.id]);
  }
}
