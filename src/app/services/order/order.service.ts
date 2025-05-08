import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from '../global/global.service';

export interface OrderResponse {
    _id: string;
    createdAt: string;
    status: string;
    totalPrice: number;
    cartItems: any[];
    paymentStatus?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        private global: GlobalService
    ) {
        this.apiUrl = this.global.apiUrl;
    }

    getUserOrders(): Observable<{ data: OrderResponse[] }> {
        const token = localStorage.getItem('user');
        return this.http.get<{ data: OrderResponse[] }>(
            `${this.apiUrl}/api/v1/orders`,
            { headers: { authorization: `Bearer ${token}` } }
        );
    }

    createOrder(body: { address: string }): Observable<{ data: OrderResponse }> {
        const token = localStorage.getItem('user');
        return this.http.post<{ data: OrderResponse }>(
            `${this.apiUrl}/api/v1/orders`,
            body,
            { headers: { authorization: `Bearer ${token}` } }
        );
    }
}