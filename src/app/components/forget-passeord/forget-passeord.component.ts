import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forget-passeord',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forget-passeord.component.html',
  styleUrls: ['./forget-passeord.component.css']
})
export class ForgetPasseordComponent {
  forgetPasswordForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email])
  });
  invalidMsg = '';

  constructor(private authService: AuthService, private router: Router) { }

  sendMail(formData: FormGroup) {
    if (!formData.valid) return;
    this.invalidMsg = '';
    const email = formData.value.email!;
    this.authService.forgetPassword(email).subscribe({
      next: res => {
        localStorage.setItem('resetToken', res.resetToken);
        localStorage.setItem('verificationStartTime', Date.now().toString());
        localStorage.setItem('resetEmail', email);
        this.router.navigate(['/verifyemail']);
      },
      error: err => {
        this.invalidMsg = err.error.error.message;
      }
    });
  }
}
