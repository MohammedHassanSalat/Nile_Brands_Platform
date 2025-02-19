import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  image2Path: string = "images/images ui/home page.svg";

  products: any[] = [];
  clothingProducts: any[] = [];
  accessoriesProducts: any[] = [];
  footwearProducts: any[] = [];

  constructor() {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    setTimeout(() => {
      this.products = [
        {
          name: 'Souvenir',
          price: 250,
          image: 'images/products details/product 1.jpg',
          description: 'A beautifully crafted souvenir that captures the essence of tradition and culture. Perfect as a keepsake or a thoughtful gift.'
      },
      {
          name: 'Handmade Necklace',
          price: 300,
          image: 'images/products details/product 3.jpg',
          description: 'A stunning handmade necklace designed with intricate details, adding elegance to any outfit. Crafted with love and care.'
      },

      {
          name: 'Sandals',
          price: 500,
          image: 'images/products details/product 2.jpg',
          description: 'Stylish and comfortable sandals made with high-quality materials. Perfect for casual outings or beachwear.'
      },
      {
          name: 'Souvenir',
          price: 150,
          image: 'images/products details/product 4.jpg',
          description: 'A charming and affordable souvenir that makes for a great travel memory or gift for loved ones.'
      },
      {
          name: 'Tea Set',
          price: 450,
          image: 'images/products details/product 5.jpg',
          description: 'A beautifully designed tea set that enhances your tea-drinking experience. Ideal for both personal use and as a thoughtful gift.'
      },
      {
        name: 'Souvenir',
        price: 150,
        image: 'images/products details/product 4.jpg',
        description: 'A charming and affordable souvenir that makes for a great travel memory or gift for loved ones.'
      },
      {
        name: 'Souvenir',
        price: 150,
        image: 'images/products details/product 4.jpg',
        description: 'A charming and affordable souvenir that makes for a great travel memory or gift for loved ones.'
      },
      {
        name: 'Souvenir',
        price: 150,
        image: 'images/products details/product 4.jpg',
        description: 'A charming and affordable souvenir that makes for a great travel memory or gift for loved ones.'
      },
      {
        name: 'Souvenir',
        price: 150,
        image: 'images/products details/product 4.jpg',
        description: 'A charming and affordable souvenir that makes for a great travel memory or gift for loved ones.'
      },
      {
        name: 'Souvenir',
        price: 150,
        image: 'images/products details/product 4.jpg',
        description: 'A charming and affordable souvenir that makes for a great travel memory or gift for loved ones.'
      },
      ];
    }, 1000);
  }
}
