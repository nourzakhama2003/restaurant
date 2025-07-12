import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    GroupCommande,
    Order,
    CreateGroupCommandeRequest,
    ParticipateRequest,
    UpdateOrderRequest
} from '../models/group-order.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GroupOrderService {
    private apiUrl = `${environment.apiUrl}/group-orders`;

    constructor(private http: HttpClient) { }

    // Create a new group commande
    createGroupCommande(request: CreateGroupCommandeRequest): Observable<GroupCommande> {
        return this.http.post<GroupCommande>(`${this.apiUrl}/create`, request);
    }

    // Get available group commandes for a restaurant
    getAvailableGroupCommandes(restaurantId: string): Observable<GroupCommande[]> {
        return this.http.get<GroupCommande[]>(`${this.apiUrl}/available/${restaurantId}`);
    }

    // Participate in a group commande
    participateInGroupCommande(request: ParticipateRequest): Observable<Order> {
        return this.http.post<Order>(`${this.apiUrl}/participate`, request);
    }

    // Update participant's order
    updateParticipantOrder(orderId: string, request: UpdateOrderRequest): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/update-order/${orderId}`, request);
    }

    // Remove participant from commande
    removeParticipantFromCommande(orderId: string, participantId: string): Observable<void> {
        const params = new HttpParams().set('participantId', participantId);
        return this.http.delete<void>(`${this.apiUrl}/remove-participant/${orderId}`, { params });
    }

    // Close commande for participation
    closeCommandeForParticipation(commandeId: string, creatorId: string): Observable<GroupCommande> {
        const params = new HttpParams().set('creatorId', creatorId);
        return this.http.put<GroupCommande>(`${this.apiUrl}/close/${commandeId}`, {}, { params });
    }

    // Get commande with all participants
    getCommandeWithParticipants(commandeId: string): Observable<GroupCommande> {
        return this.http.get<GroupCommande>(`${this.apiUrl}/details/${commandeId}`);
    }
}
