import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { CommandeService, Commande } from '../../services/commande.service';
import { RestaurantService } from '../../services/restaurant.service';
import { OrderService } from '../../services/order.service';
import { Restaurant } from '../../models/restaurant.model';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-group-orders-list',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatSelectModule,
        MatFormFieldModule
    ],
    template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>commandes</h2>
            <button mat-raised-button color="primary" (click)="createGroupOrder()">
              <mat-icon>add</mat-icon>
              Create Group Order
            </button>
          </div>
          
          <div class="row mb-3">
            <div class="col-md-4">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Filter by Restaurant</mat-label>
                <mat-select [(value)]="selectedRestaurantId" (selectionChange)="filterByRestaurant()">
                  <mat-option value="">All Restaurants</mat-option>
                  <mat-option *ngFor="let restaurant of restaurants" [value]="restaurant.id">
                    {{restaurant.name}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
          
          <div class="row">
            <div class="col-12" *ngIf="filteredCommandes.length === 0">
              <mat-card class="text-center p-4">
                <mat-card-content>
                  <mat-icon style="font-size: 48px; color: #ccc;">restaurant</mat-icon>
                  <h3 class="mt-3">No Group Orders Available</h3>
                  <p>Create a new group order to get started!</p>
                  <button mat-raised-button color="primary" (click)="createGroupOrder()">
                    Create Group Order
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
            
            <div class="col-lg-4 col-md-6 mb-3" *ngFor="let commande of filteredCommandes">
              <mat-card class="h-100">
                <mat-card-header>
                  <mat-card-title>{{getRestaurantName(commande.restaurantId)}}</mat-card-title>
                  <mat-card-subtitle>By {{commande.creatorName}}</mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="mb-2">
                    <mat-chip-set>
                      <mat-chip [color]="getStatusColor(commande.status)" selected>
                        {{commande.status.replace('_', ' ')}}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                  
                  <p><strong>Delivery:</strong> {{commande.deliveryAddress}}</p>
                  <p><strong>Phone:</strong> {{commande.deliveryPhone}}</p>
                  <p><strong>Deadline:</strong> {{formatDate(commande.orderDeadline)}}</p>
                  <p><strong>Participants:</strong> {{getParticipantCount(commande.id)}}</p>
                  <p><strong>Total:</strong> {{commande.totalPrice | currency:'USD':'symbol':'1.2-2'}}</p>
                </mat-card-content>
                
                <mat-card-actions align="end">
                  <button mat-button (click)="viewDetails(commande.id)">
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                  <button mat-raised-button color="primary" 
                          (click)="participateInOrder(commande.id)"
                          [disabled]="!commande.allowParticipation || commande.status !== 'OPEN_FOR_PARTICIPATION'">
                    <mat-icon>person_add</mat-icon>
                    Join Order
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .container-fluid {
      padding: 20px;
    }
    
    .mat-card {
      transition: transform 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .mat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .h-100 {
      height: 100%;
    }
    
    mat-chip {
      margin-right: 8px;
    }
  `]
})
export class GroupOrdersListComponent implements OnInit {
    commandes: Commande[] = [];
    filteredCommandes: Commande[] = [];
    restaurants: Restaurant[] = [];
    selectedRestaurantId: string = '';
    orderCounts: { [commandeId: string]: number } = {};

    constructor(
        private commandeService: CommandeService,
        private restaurantService: RestaurantService,
        private orderService: OrderService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadRestaurants();
        this.loadAllCommandes();
    }

    loadRestaurants(): void {
        this.restaurantService.getAllRestaurants().subscribe({
            next: (restaurants: Restaurant[]) => {
                this.restaurants = restaurants.filter((r: Restaurant) => !r.deleted);
            },
            error: (error: any) => {
                console.error('Error loading restaurants:', error);
            }
        });
    }

    loadAllCommandes(): void {
        // Load all commandes from the database
        this.commandeService.getAllCommandes().subscribe({
            next: (commandes: Commande[]) => {
                this.commandes = commandes.filter(c => !c.deleted);
                this.loadOrderCounts();
                this.filterByRestaurant();
            },
            error: (error: any) => {
                console.error('Error loading commandes:', error);
            }
        });
    }

    loadOrderCounts(): void {
        // Load order counts for each commande
        const orderCountRequests = this.commandes.map(commande =>
            this.orderService.getOrdersByCommandeId(commande.id)
        );

        if (orderCountRequests.length > 0) {
            forkJoin(orderCountRequests).subscribe({
                next: (orderArrays: any[][]) => {
                    orderArrays.forEach((orders, index) => {
                        const commandeId = this.commandes[index].id;
                        this.orderCounts[commandeId] = orders.filter(order => !order.deleted).length;
                    });
                },
                error: (error: any) => {
                    console.error('Error loading order counts:', error);
                }
            });
        }
    }

    getParticipantCount(commandeId: string): number {
        return this.orderCounts[commandeId] || 0;
    }

    filterByRestaurant(): void {
        if (this.selectedRestaurantId) {
            this.filteredCommandes = this.commandes.filter(c => c.restaurantId === this.selectedRestaurantId);
        } else {
            this.filteredCommandes = [...this.commandes];
        }
    }

    getRestaurantName(restaurantId: string): string {
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        return restaurant ? restaurant.name : 'Unknown Restaurant';
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'OPEN_FOR_PARTICIPATION':
                return 'primary';
            case 'CLOSED_FOR_PARTICIPATION':
                return 'accent';
            case 'CONFIRMED':
                return 'primary';
            case 'CANCELLED':
                return 'warn';
            default:
                return 'primary';
        }
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
    }

    createGroupOrder(): void {
        this.router.navigate(['/group-orders/create']);
    }

    viewDetails(commandeId: string): void {
        this.router.navigate(['/group-orders/details', commandeId]);
    }

    participateInOrder(commandeId: string): void {
        this.router.navigate(['/group-orders/participate', commandeId]);
    }
}
