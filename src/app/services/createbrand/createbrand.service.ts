
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface BrandPayload {
  name: string;
  description: string;
  taxID: string;
  logo: File;
}

@Injectable({ providedIn: 'root' })
export class CreatebrandService {
  private baseUrl = 'https://nile-brands-backend.up.railway.app/api/v1/brands';

  constructor(private http: HttpClient) { }

  createBrand(data: BrandPayload): Observable<any> {
    const token = localStorage.getItem('user') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const form = new FormData();
    form.append('name', data.name);
    form.append('description', data.description);
    form.append('taxID', data.taxID);
    form.append('logo', data.logo);

    return this.http.post(this.baseUrl, form, { headers })
      .pipe(
        catchError(err => throwError(() => err))
      );
  }
}
