import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  constructor(private AuthService: AuthService, private Router: Router) {}
  resetPasswordForm = new FormGroup({
    password: new FormControl(null, [Validators.required]),
    confirmPassword: new FormControl(null, [Validators.required]),
  });

  errorMessage: string = '';

  resetPassword(formData: FormGroup) {
    if (formData.valid) {
      this.errorMessage = '';
      this.AuthService.resetPassword(formData.value).subscribe({
        next: () => {
          this.Router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error.errors[0].msg;
        },
      });
    }
  }
}
