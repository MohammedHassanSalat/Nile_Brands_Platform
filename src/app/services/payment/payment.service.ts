import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from '../global/global.service';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private global: GlobalService
  ) {
    this.apiUrl = this.global.apiUrl;
  }

  createPaymentIntent(orderId: string): Observable<PaymentIntentResponse> {
    const token = localStorage.getItem('user');
    return this.http.post<PaymentIntentResponse>(
      `${this.apiUrl}/api/v1/payments`,
      { orderId },
      { headers: { authorization: `Bearer ${token}` } }
    );
  }

  confirmPayment(paymentIntentId: string): Observable<void> {
    const token = localStorage.getItem('user');
    return this.http.post<void>(
      `${this.apiUrl}/api/v1/payments/confirmPayment`,
      { paymentIntentId },
      { headers: { authorization: `Bearer ${token}` } }
    );
  }
}