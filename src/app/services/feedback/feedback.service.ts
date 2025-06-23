import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Feedback {
  _id: string;
  comment: string;
  rating: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'https://nile-brands.up.railway.app/api/v1/feedback';

  constructor(private http: HttpClient) { }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('user') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  createFeedback(comment: string, rating: number): Observable<Feedback> {
    return this.http.post<{ data: Feedback }>(
      this.apiUrl,
      { comment, rating },
      { headers: this.authHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  getAllFeedback(): Observable<Feedback[]> {
    return this.http.get<{ data: Feedback[] }>(
      this.apiUrl
    ).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }
}
