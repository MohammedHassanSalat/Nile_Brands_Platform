import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService,Product } from '../../services/productdetails/productdetails.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit {
  logo: string = 'images/images ui/nile brand.png';
  product!: Product;
  productImages: string[] = [];
  selectedImage: string = '';
  selectedSize: string | null = null;
  stars = Array(5).fill(0);
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No product ID provided.';
      this.isLoading = false;
      return;
    }

    this.productsService.getProductById(id).subscribe({
      next: (prod: Product) => {
        this.product = {
          ...prod,
          id: prod.id || prod._id,
          colors: prod.colors || [],
          sizes: prod.sizes || [],
          ratingAverage: prod.ratingAverage || 0,
          ratingCount: prod.ratingCount || 0
        };

        this.productImages = (prod.images || []).map(img =>
          this.productsService.getProductImageUrl(img)
        );

        this.selectedImage = prod.coverImage ?
          this.productsService.getProductImageUrl(prod.coverImage) :
          this.productImages[0] || '';

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load product.';
        this.isLoading = false;
      }
    });
  }

  nextImage(): void {
    if (this.productImages.length < 2) return;
    const currentIndex = this.productImages.indexOf(this.selectedImage);
    const nextIndex = (currentIndex + 1) % this.productImages.length;
    this.selectedImage = this.productImages[nextIndex];
  }

  previousImage(): void {
    if (this.productImages.length < 2) return;
    const currentIndex = this.productImages.indexOf(this.selectedImage);
    const prevIndex = (currentIndex - 1 + this.productImages.length) % this.productImages.length;
    this.selectedImage = this.productImages[prevIndex];
  }
}