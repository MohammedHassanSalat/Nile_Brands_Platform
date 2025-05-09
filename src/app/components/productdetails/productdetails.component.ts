import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ProductsService } from '../../services/productdetails/productdetails.service';
import { AuthService } from '../../services/auth/auth.service';
import { CartService } from '../../services/cart/cart.service';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { Product } from '../../interfaces/product';
import { WishlistProduct } from '../../interfaces/wishlist';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: any;
  createdAt?: string;
}

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

  reviews: Review[] = [];
  newReview = { rating: 0, comment: '', hoverRating: 0 };

  editReviewId: string | null = null;
  editReviewModel = { rating: 0, comment: '', hoverRating: 0 };

  relatedProducts: Product[] = [];
  relatedLoading = true;

  inWishlist = false;
  inCart = false;

  currentUser$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router,
    private authService: AuthService,
    public cartService: CartService,
    public wishlistService: WishlistService
  ) {
    this.currentUser$ = this.authService.currentUser.asObservable();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.loadProduct(params.get('id')!);
    });
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.productsService.getProductById(id).pipe(
      catchError(() => { this.error = 'Failed to load product'; throw ''; }),
      finalize(() => this.isLoading = false)
    ).subscribe(prod => {
      this.product = prod;
      this.productImages = (prod.images || []).map(img => this.productsService.getProductImageUrl(img));
      this.selectedImage = prod.coverImage
        ? this.productsService.getProductImageUrl(prod.coverImage)
        : this.productImages[0] || this.logo;
      this.inWishlist = this.wishlistService.isInWishlist({ ...prod } as WishlistProduct);
      this.inCart = this.cartService.isInCart(prod.id);
      this.loadReviews(prod.id);
      this.loadRelated(prod.id);
    });
  }


  toggleWishlist(): void {
    const wp = { ...this.product, __v: 0 } as WishlistProduct
    this.wishlistService.toggleWishlist(wp)
    this.inWishlist = !this.inWishlist
  }

  viewDetails(p: Product): void {
    this.router.navigate(['/products', p.id]);
  }

  private loadRelated(pid: string): void {
    this.relatedLoading = true;
    this.productsService.getRelatedProducts(pid, this.product.category.name).pipe(
      catchError(() => []),
      finalize(() => this.relatedLoading = false)
    ).subscribe(data => this.relatedProducts = data);
  }

  private loadReviews(pid: string): void {
    this.productsService.getProductReviews(pid).subscribe(data => {
      this.reviews = data;
    });
  }

  submitReview(): void {
    if (!localStorage.getItem('user')) {
      this.router.navigate(['/signin']);
      return;
    }
    if (!this.newReview.rating || !this.newReview.comment.trim()) return;

    this.isReviewOp = true;
    this.productsService.createReview(this.product.id, {
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).pipe(
      catchError(() => { this.error = 'Error submitting review'; throw ''; }),
      finalize(() => this.isReviewOp = false)
    ).subscribe(res => {
      this.reviews.unshift({ ...res.data, user: this.authService.currentUser.value });
      const total = this.product.ratingAverage * this.product.ratingCount + this.newReview.rating;
      this.product.ratingCount++;
      this.product.ratingAverage = total / this.product.ratingCount;
      this.newReview = { rating: 0, comment: '', hoverRating: 0 };
      this.reviewForm.resetForm();
    });
  }

  startEdit(review: Review): void {
    this.editReviewId = review._id;
    this.editReviewModel = { rating: review.rating, comment: review.comment, hoverRating: review.rating };
  }

  cancelEdit(): void {
    this.editReviewId = null;
    this.editReviewModel = { rating: 0, comment: '', hoverRating: 0 };
  }

  saveEdit(review: Review): void {
    if (!this.editReviewModel.rating || !this.editReviewModel.comment.trim()) return;

    this.isReviewOp = true;
    this.productsService.updateReview(this.product.id, review._id, {
      rating: this.editReviewModel.rating,
      comment: this.editReviewModel.comment
    }).pipe(
      catchError(() => { this.error = 'Error updating review'; throw ''; }),
      finalize(() => this.isReviewOp = false)
    ).subscribe(res => {
      review.rating = this.editReviewModel.rating;
      review.comment = this.editReviewModel.comment;
      this.editReviewId = null;
    });
  }

  deleteReview(review: Review): void {
    if (!confirm('Delete this review?')) return;

    this.isReviewOp = true;
    this.productsService.deleteReview(this.product.id, review._id).pipe(
      catchError(() => { this.error = 'Error deleting review'; throw ''; }),
      finalize(() => this.isReviewOp = false)
    ).subscribe(() => {
      this.reviews = this.reviews.filter(r => r._id !== review._id);
    });
  }

  setRating(rating: number, edit = false): void {
    if (edit) {
      this.editReviewModel.rating = rating;
    } else {
      this.newReview.rating = rating;
    }
  }

  setHoverRating(rating: number, edit = false): void {
    if (edit) {
      this.editReviewModel.hoverRating = rating;
    } else {
      this.newReview.hoverRating = rating;
    }
  }

  resetHoverRating(edit = false): void {
    if (edit) {
      this.editReviewModel.hoverRating = 0;
    } else {
      this.newReview.hoverRating = 0;
    }
  }

  getUserPhoto(user: any): string {
    return user?.photo || 'images/images ui/ProfileImg.png';
  }

  nextImage(): void {
    if (!this.productImages.length) return;
    const i = this.productImages.indexOf(this.selectedImage);
    this.selectedImage = this.productImages[(i + 1) % this.productImages.length];
  }

  previousImage(): void {
    if (!this.productImages.length) return;
    const i = this.productImages.indexOf(this.selectedImage);
    this.selectedImage = this.productImages[(i - 1 + this.productImages.length) % this.productImages.length];
  }

  toggleCartOrRedirect(product?: Product): void {
    const id = product ? product.id : this.product.id;
    if (!localStorage.getItem('user')) {
      this.router.navigate(['/signin']);
      return;
    }
    if (this.cartService.isInCart(id)) {
      this.router.navigate(['/cart']);
    } else {
      this.cartService.addToCart(id).subscribe(() => this.inCart = true);
    }
  }

  isInCart(id: string): boolean {
    return this.cartService.isInCart(id);
  }
}