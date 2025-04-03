import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verifyemail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verifyemail.component.html',
  styleUrl: './verifyemail.component.css',
})
export class VerifyemailComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService, private Router:Router) {}

  verifyForm = new FormGroup({
    code1: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    code2: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    code3: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    code4: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    code5: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    code6: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  errorMessage: string = '';
  timeLeft: number = 600; // 10 minutes in seconds
  timerSubscription: Subscription | null = null;
  timerDisplay: string = '10:00';

  ngOnInit() {
    this.initializeTimer();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  initializeTimer() {
    const startTime = localStorage.getItem('verificationStartTime');
    const maxTime = 600; // 10 minutes in seconds

    if (startTime) {
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      this.timeLeft = Math.max(maxTime - elapsed, 0);
    } else {
      localStorage.setItem('verificationStartTime', Date.now().toString());
    }

    if (this.timeLeft > 0) {
      this.timerSubscription = interval(1000).subscribe(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          const minutes = Math.floor(this.timeLeft / 60);
          const seconds = this.timeLeft % 60;
          this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
        } else {
          this.timerSubscription?.unsubscribe();
          this.errorMessage = 'Verification code has expired';
        }
      });
    } else {
      this.errorMessage = 'Verification code has expired';
      this.timerDisplay = '00:00';
    }
  }

  verifyEmail() {
    const resetCode: string = Object.values(this.verifyForm.value).join('');
    if (resetCode.length !== 6 || !/^\d{6}$/.test(resetCode)) {
      this.errorMessage = 'Please enter a valid 6-digit code';
      return;
    }

    this.errorMessage = '';
    this.authService.verifyResetCode(resetCode).subscribe({
      next: () => {
        this.Router.navigate(['/resetpassword']);
      },
      error: (err) => {
        this.errorMessage =
          err.error?.error?.message || 'Invalid or expired code';
      },
    });
  }
}
