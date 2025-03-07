import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  imagePath = 'images/images ui/nile brand.png';
  hideNavbar = false;

  @ViewChild('navbar') navbar!: ElementRef;
  private lastScrollTop = 0;
  private hiddenRoutes = [
    '/signin',
    '/resetpassword',
    '/forgetpassword',
    '/register',
    '/verifyemail',
    '/createbrand',
  ];

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.hideNavbar = this.hiddenRoutes.includes(this.router.url);
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.hideNavbar || !this.navbar) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop > this.lastScrollTop) {
      this.navbar.nativeElement.classList.add('navbar-hidden');
      this.navbar.nativeElement.classList.remove('navbar-visible');
      this.navbar.nativeElement.classList.add('navbar-visible');
      this.navbar.nativeElement.classList.remove('navbar-hidden');
    }
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
}
