import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService,User } from '../../services/user/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './editprofile.component.html',
  styleUrls: ['./editprofile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;

  loadingProfile = false;
  loadingPwd = false;
  successProfile = false;
  successPwd = false;
  errorProfile: string | null = null;
  errorPwd: string | null = null;
  email = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      userImage: [null]
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.userService.getMe().subscribe({
      next: (u: User) => {
        this.profileForm.patchValue({ name: u.name });
        this.email = u.email;
        this.previewUrl = this.userService.getUserImageUrl(u.userImage);
      },
      error: () => {
        this.errorProfile = 'Failed to load profile.';
      }
    });
  }

  onFileChange(evt: Event): void {
    const file = (evt.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    this.profileForm.patchValue({ userImage: file });
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(file);
  }

  submitProfile(): void {
    if (this.profileForm.invalid) return;
    this.loadingProfile = true;
    this.errorProfile = null;
    this.successProfile = false;

    const fd = new FormData();
    fd.append('name', this.profileForm.value.name);
    const img = this.profileForm.value.userImage;
    if (img) fd.append('userImage', img as File);

    this.userService.updateMe(fd).subscribe({
      next: () => {
        this.loadingProfile = false;
        this.successProfile = true;
        setTimeout(() => this.successProfile = false, 3000);
      },
      error: err => {
        this.loadingProfile = false;
        this.errorProfile = err.error?.message || 'Profile update failed.';
        setTimeout(() => this.errorProfile = null, 3000);
      }
    });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) return;
    this.loadingPwd = true;
    this.errorPwd = null;
    this.successPwd = false;

    const { currentPassword, password, confirmPassword } = this.passwordForm.value;
    this.userService.changePassword(currentPassword, password, confirmPassword).subscribe({
      next: () => {
        this.loadingPwd = false;
        this.successPwd = true;
        this.passwordForm.reset();
        setTimeout(() => this.successPwd = false, 3000);
      },
      error: err => {
        this.loadingPwd = false;
        this.errorPwd = err.error?.message || 'Change password failed.';
        setTimeout(() => this.errorPwd = null, 3000);
      }
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }
}