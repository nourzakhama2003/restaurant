import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Commande {
    id: string;
    restaurantId: string;
    creatorId: string;
    creatorName: string;
    deliveryAddress: string;
    deliveryPhone: string;
    status: string;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    orderDeadline: Date;
    allowParticipation: boolean;
    orders?: Order[];
    deleted?: boolean;
}

export interface Order {
    id: string;
    commandeId: string;
    participantId: string;
    participantName: string;
    participantPhone: string;
    items: OrderItem[];
    totalAmount: number;
    notes?: string;
    createdAt: Date;
    deleted?: boolean;
}

export interface OrderItem {
    menuItemId: string;
    menuItemName: string;
    unitPrice: number;
    quantity: number;
    notes?: string;
}

export interface CreateCommandeRequest {
    restaurantId: string;
    creatorId: string;
    creatorName: string;
    deliveryAddress: string;
    deliveryPhone: string;
    orderDeadline: Date;
}

@Injectable({
    providedIn: 'root'
})
export class CommandeService {
    private apiUrl = `${environment.apiUrl}/commandes`;

    constructor(private http: HttpClient) { }

    // Get all commandes
    getAllCommandes(): Observable<Commande[]> {
        return this.http.get<Commande[]>(this.apiUrl);
    }

    // Get commandes by restaurant
    getCommandesByRestaurant(restaurantId: string): Observable<Commande[]> {
        return this.http.get<Commande[]>(`${this.apiUrl}/restaurant/${restaurantId}`);
    }

    // Get commande by ID
    getCommandeById(commandeId: string): Observable<Commande> {
        return this.http.get<Commande>(`${this.apiUrl}/${commandeId}`);
    }

    // Get commandes by status
    getCommandesByStatus(status: string): Observable<Commande[]> {
        return this.http.get<Commande[]>(`${this.apiUrl}/status/${status}`);
    }

    // Get commandes by creator
    getCommandesByCreator(creatorId: string): Observable<Commande[]> {
        return this.http.get<Commande[]>(`${this.apiUrl}/creator/${creatorId}`);
    }

    // Create a new commande
    createCommande(commande: Commande): Observable<Commande> {
        return this.http.post<Commande>(this.apiUrl, commande);
    }

    // Update commande
    updateCommande(commandeId: string, commande: Commande): Observable<Commande> {
        return this.http.put<Commande>(`${this.apiUrl}/${commandeId}`, commande);
    }

    // Delete commande
    deleteCommande(commandeId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${commandeId}`);
    }

    // Check if commande exists
    commandeExists(commandeId: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/${commandeId}/exists`);
    }
}
