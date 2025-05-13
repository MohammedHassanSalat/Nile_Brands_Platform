import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreatebrandService } from '../../../services/createbrand/createbrand.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-createbrand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './createbrand.component.html',
  styleUrls: ['./createbrand.component.css']
})
export class CreatebrandComponent {
  form: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;
  errorMsg: string | null = null;
  success = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private service: CreatebrandService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      taxID: ['', Validators.required],
      logo: [null, Validators.required]
    });
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.form.patchValue({ logo: file });
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(file);
  }

  submit() {
    this.errorMsg = null;
    if (this.form.invalid) {
      this.errorMsg = 'Please fill out all fields.';
      return;
    }
    this.loading = true;
    const { name, description, taxID, logo } = this.form.value;
    this.service.createBrand({ name, description, taxID, logo })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/dashboard/hero'], { replaceUrl: true });
          }, 1500);
        },
        error: err => {
          this.loading = false;
          const errs = err.error?.errors;
          if (Array.isArray(errs) && errs.length) {
            this.errorMsg = errs.map(e => e.msg || e.message || JSON.stringify(e)).join('; ');
          } else {
            this.errorMsg = err.error?.message || 'Failed to create brand';
          }
        }
      });
  }
}
