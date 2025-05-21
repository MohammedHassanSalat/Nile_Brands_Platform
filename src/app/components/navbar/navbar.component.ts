import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { CartService, CartState } from '../../services/cart/cart.service';
import { CartItem } from '../../interfaces/CartItem';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

  searchTerm = '';
  private search$ = new Subject<string>();

  @ViewChild('navbar') navbar!: ElementRef;
  private lastScrollTop = 0;
  private hiddenExact = [
    '/signin', '/resetpassword', '/forgetpassword', '/register',
    '/verifyemail', '/createbrand', '/dashboard', '/dashboard/hero',
    '/dashboard/addproduct', '/dashboard/profile', '/dashboard/updatebrand',
    '/trackorder'
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private cartService: CartService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects.split('?')[0];
      const baseUrl = url.split('/').slice(0, 2).join('/');
      const isExactHidden = this.hiddenExact.includes(url) || this.hiddenExact.includes(baseUrl);
      const isProductDetail = url.startsWith('/products/');
      this.hideNavbar = isExactHidden || isProductDetail;
    });

    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.router.navigate(['/home'], { queryParams: { search: term || null } });
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if (user?.userImage) {
        this.profileImage = this.userService.getUserImageUrl(user.userImage);
      }
    });
    this.authService.isUserRestored().subscribe(restored => this.authRestored = restored);
    this.cartService.cart$.subscribe((state: CartState) => {
      this.cartCount = state.items.reduce((sum, item: CartItem) => sum + item.quantity, 0);
    });
  }

  onSearch(value: string): void {
    this.search$.next(value.trim());
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.search$.next(this.searchTerm.trim());
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.hideNavbar || !this.navbar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const navEl = this.navbar.nativeElement as HTMLElement;
    if (scrollTop > this.lastScrollTop) {
      navEl.classList.add('navbar-hidden');
      navEl.classList.remove('navbar-visible');
    } else {
      navEl.classList.add('navbar-visible');
      navEl.classList.remove('navbar-hidden');
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
