import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/productdetails/productdetails.service';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, catchError, finalize } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-productdetails',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit {
  @ViewChild('reviewForm') reviewForm!: NgForm;
  logo = 'images/images ui/nile brand.png';
  product!: Product;
  productImages: string[] = [];
  selectedImage = '';
  selectedSize: string | null = null;
  stars = Array(5).fill(0);
  isLoading = true;
  isReviewOp = false;
  error: string | null = null;
  reviews: any[] = [];
  newReview = { rating: 0, comment: '', hoverRating: 0 };
  editReviewId: string | null = null;
  editReviewModel = { rating: 0, comment: '', hoverRating: 0 };
  currentUser$: Observable<any>;
  relatedProducts: Product[] = [];
  relatedLoading = true;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router,
    private authService: AuthService,
    public cartService: CartService
  ) {
    this.currentUser$ = this.authService.currentUser.asObservable();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadProduct(id);
  }

  private loadProduct(id: string): void {
    this.productsService.getProductById(id).pipe(
      catchError(err => {
        this.handleError('Failed to load product');
        throw err;
      })
    ).subscribe({
      next: prod => {
        this.product = {
          _id: prod._id || '',
          id: prod.id || prod._id || '',
          name: prod.name,
          description: prod.description,
          price: prod.price,
          quantity: prod.quantity,
          sold: prod.sold,
          ratingAverage: prod.ratingAverage || 0,
          ratingCount: prod.ratingCount || 0,
          category: prod.category || { name: 'Related Products' },
          subcategory: prod.subcategory || { name: '' },
          brand: prod.brand || { name: '' },
          sizes: prod.sizes || [],
          colors: prod.colors || [],
          images: prod.images || [],
          coverImage: prod.coverImage
        };

        this.productImages = (prod.images || []).map(img =>
          this.productsService.getProductImageUrl(img)
        );
        this.selectedImage = prod.coverImage
          ? this.productsService.getProductImageUrl(prod.coverImage)
          : this.productImages[0] || 'images/images ui/nile brand.png';

        this.loadReviews(this.product.id);
        this.loadRelatedProducts();
        this.isLoading = false;
      }
    });
  }

  private loadRelatedProducts(): void {
    if (!this.product.category.name) return;

    this.relatedLoading = true;
    this.productsService.getRelatedProducts(
      this.product.id,
      this.product.category.name
    ).pipe(
      finalize(() => this.relatedLoading = false),
      catchError(err => {
        console.error('Error loading related products:', err);
        return [];
      })
    ).subscribe(products => {
      this.relatedProducts = products as Product[];
    });
  }

  private loadReviews(pid: string): void {
    this.productsService.getProductReviews(pid).subscribe({
      next: data => this.reviews = data,
      error: err => console.error('Error loading reviews:', err)
    });
  }

  submitReview(): void {
    if (!localStorage.getItem('user')) {
      this.router.navigate(['/signin']);
      return;
    }

    const { rating, comment } = this.newReview;
    if (!rating || !comment.trim()) return;

    this.isReviewOp = true;
    this.error = null;

    this.productsService.createReview(this.product.id, { rating, comment }).pipe(
      finalize(() => this.isReviewOp = false)
    ).subscribe({
      next: res => this.handleReviewSuccess(res, rating),
      error: err => this.handleReviewError(err)
    });
  }

  private handleReviewSuccess(res: any, rating: number): void {
    this.reviews.unshift({
      ...res.data,
      user: {
        _id: this.authService.currentUser.value?._id,
        name: this.authService.currentUser.value?.name,
        photo: this.authService.currentUser.value?.photo
      }
    });

    this.product.ratingCount++;
    this.product.ratingAverage =
      ((this.product.ratingAverage * (this.product.ratingCount - 1)) + rating
        / this.product.ratingCount);

    this.newReview = { rating: 0, comment: '', hoverRating: 0 };
    this.reviewForm.resetForm();
  }

  private handleReviewError(err: any): void {
    const errorMessage = err.error?.errors?.[0]?.msg || 'Error submitting review';
    this.error = Array.isArray(err.error?.errors)
      ? err.error.errors.map((e: any) => e.msg).join(', ')
      : errorMessage;
  }

  startEdit(rev: any): void {
    this.editReviewId = rev._id;
    this.editReviewModel = {
      rating: rev.rating,
      comment: rev.comment,
      hoverRating: rev.rating
    };
  }

  cancelEdit(): void {
    this.editReviewId = null;
    this.editReviewModel = { rating: 0, comment: '', hoverRating: 0 };
  }

  saveEdit(rev: any): void {
    const { rating, comment } = this.editReviewModel;
    if (!rating || !comment.trim()) return;

    this.isReviewOp = true;
    this.error = null;

    this.productsService.updateReview(this.product.id, rev._id, { rating, comment }).pipe(
      finalize(() => this.isReviewOp = false)
    ).subscribe({
      next: res => {
        Object.assign(rev, res.data);
        const oldRating = rev.rating;
        rev.rating = rating;
        this.product.ratingAverage =
          ((this.product.ratingAverage * this.product.ratingCount) - oldRating + rating)
          / this.product.ratingCount;
        this.editReviewId = null;
      },
      error: err => this.handleReviewError(err)
    });
  }

  deleteReview(rev: any): void {
    if (!confirm('Delete this review?')) return;

    this.isReviewOp = true;
    this.productsService.deleteReview(this.product.id, rev._id).pipe(
      finalize(() => this.isReviewOp = false)
    ).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r._id !== rev._id);
        this.product.ratingCount--;
        this.product.ratingAverage =
          ((this.product.ratingAverage * (this.product.ratingCount + 1)) - rev.rating)
          / this.product.ratingCount;
      },
      error: err => this.handleReviewError(err)
    });
  }

  setRating(rating: number, isEdit = false): void {
    if (isEdit) {
      this.editReviewModel.rating = rating;
    } else {
      this.newReview.rating = rating;
    }
  }

  setHoverRating(rating: number, isEdit = false): void {
    if (isEdit) {
      this.editReviewModel.hoverRating = rating;
    } else {
      this.newReview.hoverRating = rating;
    }
  }

  resetHoverRating(isEdit = false): void {
    if (isEdit) {
      this.editReviewModel.hoverRating = 0;
    } else {
      this.newReview.hoverRating = 0;
    }
  }

  getUserPhoto(user: any): string {
    return user?.photo || 'images/images ui/ProfileImg.png';
  }

  nextImage(): void {
    if (this.productImages.length < 2) return;
    const i = this.productImages.indexOf(this.selectedImage);
    this.selectedImage = this.productImages[(i + 1) % this.productImages.length];
  }

  previousImage(): void {
    if (this.productImages.length < 2) return;
    const i = this.productImages.indexOf(this.selectedImage);
    this.selectedImage = this.productImages[(i - 1 + this.productImages.length) % this.productImages.length];
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  toggleCartOrRedirect(product: Product): void {
    const token = localStorage.getItem('user');
    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }

    if (this.cartService.isInCart(product.id)) {
      this.router.navigate(['/cart']);
    } else {
      this.cartService.addToCart(product.id).subscribe({
        next: () => this.cartService.loadCart(),
        error: err => console.error('Error adding to cart', err)
      });
    }
  }

  private handleError(message: string): void {
    this.error = message;
    this.isLoading = false;
  }

  viewDetails(product: Product): void {
    this.isLoading = true;
    this.relatedLoading = true;
    this.product = null!;
    this.relatedProducts = [];
    this.reviews = [];

    setTimeout(() => {
      this.router.navigate(['/products', product.id])
        .then(() => {
          window.scrollTo(0, 0);
          this.loadProduct(product.id);
        });
    }, 50);
  }

}