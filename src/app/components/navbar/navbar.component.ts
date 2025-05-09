import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { CartService, CartState } from '../../services/cart/cart.service';
import { CartItem } from '../../interfaces/CartItem';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  profileImage = 'images/images ui/ProfileImg.png';
  logo = 'images/images ui/nile brand.png';
  hideNavbar = false;
  user: any = null;
  isDropdownOpen = false;
  authRestored = false;
  cartCount = 0;

  @ViewChild('navbar') navbar!: ElementRef;
  private lastScrollTop = 0;
  private hiddenExact = [
    '/signin',
    '/resetpassword',
    '/forgetpassword',
    '/register',
    '/verifyemail',
    '/createbrand',
    '/dashboard',
    '/dashboard/hero',
    '/dashboard/addproduct',
    '/dashboard/profile',
    '/dashboard/updatebrand',
    '/trackorder' 
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects.split('?')[0]; 
        const baseUrl = url.split('/').slice(0, 2).join('/'); 
        const isExactHidden = this.hiddenExact.includes(url) || this.hiddenExact.includes(baseUrl);
        const isProductDetail = url.startsWith('/products/');
        this.hideNavbar = isExactHidden || isProductDetail;
      });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => this.user = user);
    this.authService.isUserRestored().subscribe(restored => this.authRestored = restored);
    this.cartService.cart$.subscribe((state: CartState) => {
      this.cartCount = state.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.hideNavbar || !this.navbar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > this.lastScrollTop) {
      this.navbar.nativeElement.classList.add('navbar-hidden');
      this.navbar.nativeElement.classList.remove('navbar-visible');
    } else {
      this.navbar.nativeElement.classList.add('navbar-visible');
      this.navbar.nativeElement.classList.remove('navbar-hidden');
    }
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isDropdownOpen = false;
    this.router.navigate(['/home']).then(() => window.location.reload());
  }
}