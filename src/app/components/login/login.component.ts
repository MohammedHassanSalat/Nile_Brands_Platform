import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(private AuthService: AuthService, private Router: Router) { }
  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  invalidLoginMsg: string = '';

  login(formData: FormGroup) {
    if (formData.valid) {
      this.invalidLoginMsg = '';
      this.AuthService.login(formData.value).subscribe({
        next: (res) => {
          if (res.token) {
            localStorage.setItem('user', res.token);
            this.AuthService.getLoggedUser().subscribe({
              next: (userRes) => {
                const role = userRes.data?.role;
                this.AuthService.currentUser.next(userRes.data);
                if (role === 'user') {
                  this.Router.navigate(['/home']);
                } else if (role === 'owner') {
                  this.Router.navigate(['/dashboard/hero']);
                }
              },
              error: (err) => {
                console.error('Error fetching user data:', err);
                this.Router.navigate(['/home']);
              },
            });
          }
        },
        error: (err) => {
          this.invalidLoginMsg =  err.error?.error?.message || 'Login failed.';
        },
      });
    }
  }
}
