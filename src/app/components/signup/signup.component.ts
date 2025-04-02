import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  constructor(private AuthService: AuthService, private Router: Router) {}
  signupForm = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    role: new FormControl('user', [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    confirmPassword: new FormControl(null, [Validators.required]),
  });

  emailError: string = '';
  passwordError: string = '';

  signup(formData: FormGroup) {
    if (formData.valid) {
      this.emailError = '';
      this.passwordError = '';
      this.AuthService.signup(formData.value).subscribe({
        next: (res) => {
          if (res.token) {
            localStorage.setItem('user', res.token);
            if (res.data?.role) {
              this.AuthService.currentUser.next(res.data);
              if (res.data?.role === 'user') {
                this.Router.navigate(['/home']);
              } else if (res.data?.role === 'owner') {
                this.Router.navigate(['/createbrand']);
              } else {
                this.Router.navigate(['/home']);
              }
            }
          }
        },
        error: (err) => {
          if (err.error && err.error.errors) {
            err.error.errors.forEach((error: any) => {
              if (error.path === 'email') this.emailError = error.msg;
              if (error.path === 'password') this.passwordError = error.msg;
            });
          }
        },
      });
    }
  }
}
