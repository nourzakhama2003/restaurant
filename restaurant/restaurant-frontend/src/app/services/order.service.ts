import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/group-order.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    // Create order
    createOrder(order: any): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, order);
    }

    // Get all orders
    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl);
    }

    // Get order by ID
    getOrderById(id: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    // Get orders by commande ID
    getOrdersByCommandeId(commandeId: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/commande/${commandeId}`);
    }

    // Get orders by participant ID
    getOrdersByParticipantId(participantId: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/participant/${participantId}`);
    }

    // Get orders by commande and participant
    getOrdersByCommandeAndParticipant(commandeId: string, participantId: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/commande/${commandeId}/participant/${participantId}`);
    }

    // Update order
    updateOrder(id: string, order: Order): Observable<Order> {
        console.log('🔄 OrderService: Calling updateOrder API');
        console.log('   URL:', `${this.apiUrl}/${id}`);
        console.log('   Order data:', order);

        return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
    }

    // Delete order
    deleteOrder(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
