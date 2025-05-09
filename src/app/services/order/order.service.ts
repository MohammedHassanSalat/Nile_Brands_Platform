import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface TrackResponse {
    status: string;
}

export interface OrderListResponse {
    data: OrderResponse[];
    pagination: { currentPage: number; limit: number; totalPages: number; next: number | null; };
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

    getUserOrders(page: number = 1, limit: number = 15): Observable<OrderListResponse> {
        const token = localStorage.getItem('user');
        const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
        return this.http.get<OrderListResponse>(
            `${this.apiUrl}/api/v1/orders`,
            { headers: { authorization: `Bearer ${token}` }, params }
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

    trackOrder(orderId: string): Observable<TrackResponse> {
        const token = localStorage.getItem('user');
        return this.http.get<TrackResponse>(
            `${this.apiUrl}/api/v1/orders/trackOrder/${orderId}`,
            { headers: { authorization: `Bearer ${token}` } }
        );
    }
}