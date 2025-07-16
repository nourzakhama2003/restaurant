import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';
import { CommandeService } from '../../services/commande.service';
import { UserService } from '../../services/user.service';
import { Order } from '../../models/group-order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>My Orders</h2>
              <p class="text-muted">View all your participated orders</p>
            </div>
            <button mat-raised-button color="primary" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back
            </button>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="row" *ngIf="orders.length > 0; else noOrders">
        <div class="col-12">
          <div class="orders-grid">
            <mat-card *ngFor="let order of orders" class="order-card mb-3">
              <mat-card-header>
                <mat-card-title class="d-flex justify-content-between align-items-center">
                  <span>Order #{{order.id.substring(0, 8)}}...</span>
                  <span class="order-total">{{order.totalAmount | currency:'USD':'symbol':'1.2-2'}}</span>
                </mat-card-title>
                <mat-card-subtitle>
                  <div class="order-meta">
                    <span><mat-icon>person</mat-icon> {{order.participantName}}</span>
                    <span><mat-icon>phone</mat-icon> {{order.participantPhone}}</span>
                    <span><mat-icon>schedule</mat-icon> {{formatDate(order.createdAt)}}</span>
                  </div>
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <!-- Order Items -->
                <div class="order-items">
                  <h4>Items Ordered:</h4>
                  <div class="items-list">
                    <div *ngFor="let item of order.items" class="item-row">
                      <div class="item-info">
                        <span class="item-name">{{item.menuItemName}}</span>
                        <span class="item-quantity">x{{item.quantity}}</span>
                      </div>
                      <div class="item-price">
                        {{(item.unitPrice * item.quantity) | currency:'USD':'symbol':'1.2-2'}}
                      </div>
                      <div *ngIf="item.notes" class="item-notes">
                        <small class="text-muted">Note: {{item.notes}}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Order Notes -->
                <div *ngIf="order.notes" class="order-notes mt-3">
                  <h5>Order Notes:</h5>
                  <p class="text-muted">{{order.notes}}</p>
                </div>

                <!-- Group Order Info -->
                <div class="group-order-info mt-3" *ngIf="getCommandeInfo(order.commandeId)">
                  <h5>Group Order Details:</h5>
                  <div class="group-info">
                    <span><strong>Created by:</strong> {{getCommandeInfo(order.commandeId)?.creatorName}}</span>
                    <span><strong>Total Group Order:</strong> {{getCommandeInfo(order.commandeId)?.totalPrice | currency:'USD':'symbol':'1.2-2'}}</span>
                    <span><strong>Status:</strong> {{getCommandeInfo(order.commandeId)?.status}}</span>
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="viewGroupOrder(order.commandeId)">
                  <mat-icon>group</mat-icon>
                  View Group Order
                </button>
                <button mat-button color="warn" (click)="deleteOrder(order.id)" 
                        [disabled]="!canDeleteOrder(order)">
                  <mat-icon>delete</mat-icon>
                  Delete Order
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- No Orders Template -->
      <ng-template #noOrders>
        <div class="row">
          <div class="col-12 text-center">
            <mat-card class="no-orders-card">
              <mat-card-content>
                <mat-icon class="large-icon">shopping_cart_off</mat-icon>
                <h3>No Orders Found</h3>
                <p class="text-muted">You haven't participated in any group orders yet.</p>
                <button mat-raised-button color="primary" (click)="goToGroupOrders()">
                  <mat-icon>add_shopping_cart</mat-icon>
                  Browse Group Orders
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </ng-template>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center">
        <mat-icon class="spinning">refresh</mat-icon>
        <p>Loading your orders...</p>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid {
      padding: 20px;
    }

    .order-card {
      transition: transform 0.2s ease-in-out;
    }

    .order-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .order-total {
      font-size: 1.2em;
      font-weight: bold;
      color: #4caf50;
    }

    .order-meta {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .order-meta span {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.9em;
    }

    .order-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .order-items {
      margin: 16px 0;
    }

    .items-list {
      background-color: #f9f9f9;
      border-radius: 4px;
      padding: 12px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
      flex-wrap: wrap;
    }

    .item-row:last-child {
      border-bottom: none;
    }

    .item-info {
      display: flex;
      gap: 10px;
      align-items: center;
      flex: 1;
    }

    .item-name {
      font-weight: 500;
    }

    .item-quantity {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: bold;
    }

    .item-price {
      font-weight: bold;
      color: #4caf50;
    }

    .item-notes {
      width: 100%;
      margin-top: 4px;
    }

    .group-order-info {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
    }

    .group-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .group-info span {
      font-size: 0.9em;
    }

    .no-orders-card {
      padding: 40px;
      text-align: center;
    }

    .large-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #9e9e9e;
      margin-bottom: 20px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .order-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .item-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .group-info {
        font-size: 0.8em;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  commandeDetails: { [key: string]: any } = {};
  isLoading = false;
  currentUserId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private commandeService: CommandeService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUserInfo().subscribe({
      next: (userInfo) => {
        if (userInfo) {
          this.currentUserId = userInfo.id;
          this.loadMyOrders();
        } else {
          this.snackBar.open('Unable to load user information', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error loading user information:', error);
        this.snackBar.open('Error loading user information', 'Close', { duration: 3000 });
      }
    });
  }

  loadMyOrders(): void {
    if (!this.currentUserId) return;

    this.isLoading = true;
    this.orderService.getOrdersByParticipantId(this.currentUserId).subscribe({
      next: (orders) => {
        this.orders = orders.filter(order => !order.deleted);
        this.loadCommandeDetails();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Error loading your orders', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadCommandeDetails(): void {
    const commandeIds = [...new Set(this.orders.map(order => order.commandeId))];

    commandeIds.forEach(commandeId => {
      this.commandeService.getCommandeById(commandeId).subscribe({
        next: (commande) => {
          this.commandeDetails[commandeId] = commande;
        },
        error: (error) => {
          console.error(`Error loading commande ${commandeId}:`, error);
        }
      });
    });
  }

  getCommandeInfo(commandeId: string): any {
    return this.commandeDetails[commandeId];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  }

  canDeleteOrder(order: Order): boolean {
    const commandeInfo = this.getCommandeInfo(order.commandeId);
    if (!commandeInfo) return false;

    // Allow deletion only if group order is still open for participation
    const now = new Date();
    const createdAt = new Date(commandeInfo.createdAt);
    const participationEndTime = new Date(createdAt.getTime() + (commandeInfo.participationDurationMinutes * 60 * 1000));

    return now < participationEndTime && commandeInfo.allowParticipation;
  }

  deleteOrder(orderId: string): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => {
          this.snackBar.open('Order deleted successfully', 'Close', { duration: 3000 });
          this.loadMyOrders(); // Reload orders
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          this.snackBar.open('Error deleting order', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewGroupOrder(commandeId: string): void {
    this.router.navigate(['/group-orders', commandeId]);
  }

  goBack(): void {
    window.history.back();
  }

  goToGroupOrders(): void {
    this.router.navigate(['/group-orders']);
  }
}
