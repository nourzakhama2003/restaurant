import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';

export interface Commande {
    id: string;
    restaurantId: string;
    creatorId: string;
    creatorName: string;
    status: string;
    totalPrice: number;
    deliveryFee?: number;
    createdAt: Date;
    updatedAt: Date;
    orderDeadline: Date;
    participationDurationMinutes?: number;
    allowParticipation?: boolean;
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


    getAllCommandes(): Observable<Commande[]> {
        return this.http.get<Commande[]>(this.apiUrl);
    }


    getCommandesByRestaurant(restaurantId: string): Observable<Commande[]> {
        return this.http.get<Commande[]>(`${this.apiUrl}/restaurant/${restaurantId}`);
    }

    getCommandeById(commandeId: string): Observable<Commande> {
        return this.http.get<Commande>(`${this.apiUrl}/${commandeId}`);
    }


    getCommandeWithRestaurantById(commandeId: string): Observable<CommandeWithRestaurant> {
        return this.http.get<CommandeWithRestaurant>(`${this.apiUrl}/${commandeId}/with-restaurant`);
    }

    getCommandesByStatus(status: string): Observable<Commande[]> {
        return this.http.get<Commande[]>(`${this.apiUrl}/status/${status}`);
    }


    getCommandesByCreator(creatorId: string): Observable<Commande[]> {
        return this.http.get<Commande[]>(`${this.apiUrl}/creator/${creatorId}`);
    }


    createCommande(commande: Commande): Observable<Commande> {
        return this.http.post<Commande>(this.apiUrl, commande);
    }

    updateCommande(commandeId: string, commande: Commande): Observable<Commande> {
        return this.http.put<Commande>(`${this.apiUrl}/${commandeId}`, commande);
    }


    updateCommandeTotal(commandeId: string, totalPrice: number): Observable<Commande> {
        const updateUrl = `${this.apiUrl}/${commandeId}/total`;
        const payload = { totalPrice };

        console.log(`🔄 Calling API to update commande total:`);
        console.log(`   URL: ${updateUrl}`);
        console.log(`   Payload:`, payload);

        return this.http.patch<Commande>(updateUrl, payload);
    }


    recalculateCommandeTotal(commandeId: string): Observable<Commande> {
        const recalculateUrl = `${this.apiUrl}/${commandeId}/recalculate-total`;

        console.log(`🔄 Calling API to recalculate commande total:`);
        console.log(`   URL: ${recalculateUrl}`);

        return this.http.post<Commande>(recalculateUrl, {});
    }


    deleteCommande(commandeId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${commandeId}`);
    }


    commandeExists(commandeId: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/${commandeId}/exists`);
    }


    updateCommandeStatus(commandeId: string, newStatus: string): Observable<Commande> {
        const statusUrl = `${this.apiUrl}/${commandeId}/status`;
        const payload = { status: newStatus };
        console.log('PATCH to:', statusUrl, 'with payload:', payload);
        return this.http.patch<Commande>(statusUrl, payload);
    }


    checkAndAutoCloseExpiredCommandes(): Observable<void> {
        const autoCloseUrl = `${this.apiUrl}/auto-close-expired`;

        console.log(`🔄 Calling API to auto-close expired commandes:`);
        console.log(`   URL: ${autoCloseUrl}`);

        return this.http.post<void>(autoCloseUrl, {});
    }


    isCommandeExpired(commande: Commande): boolean {
        if (!commande.orderDeadline) {
            return false;
        }

        const deadline = new Date(commande.orderDeadline);
        const now = new Date();
        return now > deadline;
    }


    shouldAutoClose(commande: Commande): boolean {
        return commande.status === 'created' && this.isCommandeExpired(commande);
    }
}
