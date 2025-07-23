import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderItem } from '../models/group-order.model';

export interface Commande {
    id: string;
    restaurantId: string;
    creatorId: string;
    creatorName: string;
    status: string; // 'created', 'closed', 'confirmed', 'cancelled'
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    orderDeadline: Date; // Full date and time when order participation closes
    participationDurationMinutes?: number; // Duration in minutes for participation
    allowParticipation?: boolean; // Whether participation is allowed
    orders?: Order[];
    deleted?: boolean;
}

export interface CommandeWithRestaurant extends Commande {
    restaurantName: string;
}

export interface CreateCommandeRequest {
    restaurantId: string;
    creatorId: string;
    creatorName: string;
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

    // Get commande by ID with restaurant information
    getCommandeWithRestaurantById(commandeId: string): Observable<CommandeWithRestaurant> {
        return this.http.get<CommandeWithRestaurant>(`${this.apiUrl}/${commandeId}/with-restaurant`);
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

    // Update commande total price only
    updateCommandeTotal(commandeId: string, totalPrice: number): Observable<Commande> {
        const updateUrl = `${this.apiUrl}/${commandeId}/total`;
        const payload = { totalPrice };

        console.log(`🔄 Calling API to update commande total:`);
        console.log(`   URL: ${updateUrl}`);
        console.log(`   Payload:`, payload);

        return this.http.patch<Commande>(updateUrl, payload);
    }

    // Manually recalculate commande total from existing orders
    recalculateCommandeTotal(commandeId: string): Observable<Commande> {
        const recalculateUrl = `${this.apiUrl}/${commandeId}/recalculate-total`;

        console.log(`🔄 Calling API to recalculate commande total:`);
        console.log(`   URL: ${recalculateUrl}`);

        return this.http.post<Commande>(recalculateUrl, {});
    }

    // Delete commande
    deleteCommande(commandeId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${commandeId}`);
    }

    // Check if commande exists
    commandeExists(commandeId: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/${commandeId}/exists`);
    }

    // Update commande status
    updateCommandeStatus(commandeId: string, newStatus: string): Observable<Commande> {
        const statusUrl = `${this.apiUrl}/${commandeId}/status`;
        const payload = { status: newStatus };
        console.log('PATCH to:', statusUrl, 'with payload:', payload);
        return this.http.patch<Commande>(statusUrl, payload);
    }

    // Auto-close expired commandes (triggers backend check)
    checkAndAutoCloseExpiredCommandes(): Observable<void> {
        const autoCloseUrl = `${this.apiUrl}/auto-close-expired`;

        console.log(`🔄 Calling API to auto-close expired commandes:`);
        console.log(`   URL: ${autoCloseUrl}`);

        return this.http.post<void>(autoCloseUrl, {});
    }

    // Check if a commande is expired
    isCommandeExpired(commande: Commande): boolean {
        if (!commande.orderDeadline) {
            return false;
        }

        const deadline = new Date(commande.orderDeadline);
        const now = new Date();
        return now > deadline;
    }

    // Check if commande should auto-close
    shouldAutoClose(commande: Commande): boolean {
        return commande.status === 'created' && this.isCommandeExpired(commande);
    }
}
