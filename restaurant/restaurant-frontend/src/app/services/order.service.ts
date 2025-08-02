import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    createOrder(order: any): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, order);
    }

    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl);
    }

    getOrderById(id: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    getOrdersByCommandeId(commandeId: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/commande/${commandeId}`);
    }

    getOrdersByParticipantId(participantId: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/participant/${participantId}`);
    }

    getOrdersByCommandeAndParticipant(commandeId: string, participantId: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/commande/${commandeId}/participant/${participantId}`);
    }

    updateOrder(id: string, order: Order): Observable<Order> {


        return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
    }

    deleteOrder(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
