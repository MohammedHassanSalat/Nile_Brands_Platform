import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from '../global/global.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        private global: GlobalService
    ) {
        this.apiUrl = this.global.apiUrl;
    }

    getUserOrders(): Observable<any> {
        const token = localStorage.getItem('user');
        return this.http.get<any>(
            `${this.apiUrl}/api/v1/orders`,
            { headers: { authorization: `Bearer ${token}` } }
        );
    }

    createOrder(body: { address: string }): Observable<any> {
        const token = localStorage.getItem('user');
        return this.http.post<any>(
            `${this.apiUrl}/api/v1/orders`,
            body,
            { headers: { authorization: `Bearer ${token}` } }
        );
    }
}