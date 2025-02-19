import { Component } from '@angular/core';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent {
  wishlistImage: string = 'images/images ui/empty wishlist.jpg';
}
