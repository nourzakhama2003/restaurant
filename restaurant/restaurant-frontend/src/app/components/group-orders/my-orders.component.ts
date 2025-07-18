import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CommandeService, CommandeWithRestaurant } from '../../services/commande.service';
import { UserService } from '../../services/user.service';
import { Order } from '../../models/group-order.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
  template: `
    <div class="my-orders-wrapper">
      <div class="header-row">
        <div>
          <h2 class="page-title">My Orders</h2>
          <p class="subtitle">All your group order participations, beautifully organized.</p>
        </div>
        <button mat-stroked-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-filter-section">
        <div class="search-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search by restaurant name</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Enter restaurant name...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>Filter by date</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" (dateChange)="applyFilters()" placeholder="Choose a date">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
          
          <button mat-stroked-button (click)="clearFilters()" class="clear-btn">
            <mat-icon>clear</mat-icon>
            Clear Filters
          </button>
        </div>
        
        <div class="filter-info" *ngIf="searchTerm || selectedDate">
          <mat-icon>filter_list</mat-icon>
          <span>Showing {{ filteredOrders.length }} of {{ orders.length }} orders</span>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <mat-icon class="spinning">refresh</mat-icon>
        <p>Loading your orders...</p>
      </div>

      <ng-container *ngIf="!isLoading">
        <div *ngIf="filteredOrders.length > 0; else noOrders">
          <div class="orders-timeline">
            <div *ngFor="let order of filteredOrders; let i = index" class="timeline-item">
              <div class="timeline-badge">
                <span class="order-number">{{ i + 1 }}</span>
              </div>
              <mat-card class="order-card">
                <mat-card-header>
                  <mat-card-title class="d-flex justify-content-between align-items-center">
                    <span class="order-title">Order <span class="order-num">{{ i + 1 }}</span></span>
                    <span class="order-total">{{ order.totalAmount | currency:'USD':'symbol':'1.2-2' }}</span>
                  </mat-card-title>
                  <mat-card-subtitle>
                    <div class="order-meta">
                      <span class="restaurant-name" *ngIf="getRestaurantName(order.commandeId)">
                        <mat-icon>restaurant</mat-icon> {{ getRestaurantName(order.commandeId) }}
                      </span>
                      <span><mat-icon>person</mat-icon> {{ order.participantName }}</span>
                      <span><mat-icon>schedule</mat-icon> {{ formatDate(order.createdAt) }}</span>
                      <span *ngIf="getCommandeInfo(order.commandeId)">
                        <mat-icon>info</mat-icon>
                        <span class="status-badge" [ngClass]="getCommandeInfo(order.commandeId)?.status?.toLowerCase() || ''">{{ getCommandeInfo(order.commandeId)?.status || 'Unknown' }}</span>
                      </span>
                    </div>
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="order-items">
                    <h4>Items</h4>
                    <div class="items-list">
                      <div *ngFor="let item of order.items" class="item-row">
                        <div class="item-info">
                          <span class="item-name">{{ item.menuItemName }}</span>
                          <span class="item-quantity">x{{ item.quantity }}</span>
                        </div>
                        <div class="item-price">
                          {{ (item.unitPrice * item.quantity) | currency:'USD':'symbol':'1.2-2' }}
                        </div>
                        <div *ngIf="item.notes" class="item-notes">
                          <small class="text-muted">Note: {{ item.notes }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="order.notes" class="order-notes mt-3">
                    <mat-icon class="notes-icon">sticky_note_2</mat-icon>
                    <span class="notes-label">Order Notes:</span>
                    <span class="notes-content">{{ order.notes }}</span>
                  </div>
                  <div class="group-order-info mt-3" *ngIf="getCommandeInfo(order.commandeId)">
                    <h5>Group Order</h5>
                    <div class="group-info">
                      <span class="restaurant-info" *ngIf="getRestaurantName(order.commandeId)">
                        <mat-icon>restaurant</mat-icon> <strong>Restaurant:</strong> {{ getRestaurantName(order.commandeId) }}
                      </span>
                      <span><mat-icon>person</mat-icon> <strong>Created by:</strong> {{ getCommandeInfo(order.commandeId)?.creatorName }}</span>
                      <span><mat-icon>attach_money</mat-icon> <strong>Total:</strong> {{ getCommandeInfo(order.commandeId)?.totalPrice | currency:'USD':'symbol':'1.2-2' }}</span>
                      <span><mat-icon>schedule</mat-icon> <strong>Status:</strong> <span class="status-badge" [ngClass]="getCommandeInfo(order.commandeId)?.status?.toLowerCase() || ''">{{ getCommandeInfo(order.commandeId)?.status || 'Unknown' }}</span></span>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-stroked-button color="primary" (click)="viewDetails(order.commandeId)">
                    <mat-icon>group</mat-icon>
                   viewDetails
                  </button>
                  <button mat-stroked-button color="warn" (click)="deleteOrder(order)" [disabled]="!canManageOrder(order)">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </div>
        <ng-template #noOrders>
          <div class="empty-state">
            <mat-icon class="large-icon">shopping_cart_off</mat-icon>
            <h3>No Orders Found</h3>
            <p class="text-muted" *ngIf="searchTerm || selectedDate">
              No orders match your current filters. Try adjusting your search criteria.
            </p>
            <p class="text-muted" *ngIf="!searchTerm && !selectedDate">
              You haven't participated in any group orders yet. Start exploring and join your first group order!
            </p>
            <button mat-raised-button color="primary" (click)="goToGroupOrders()">
              <mat-icon>add_shopping_cart</mat-icon>
              Browse Group Orders
            </button>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `,
  styles: [`
    .my-orders-wrapper {
      max-width: 900px;
      margin: 40px auto;
      padding: 24px 12px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 0;
      color: #22223b;
    }
    .subtitle {
      color: #6c757d;
      font-size: 1.1rem;
      margin-bottom: 0;
    }
    .search-filter-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      border: 1px solid #e9ecef;
    }
    .search-row {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 1;
      min-width: 250px;
    }
    .date-field {
      min-width: 200px;
    }
    .clear-btn {
      height: 56px;
      white-space: nowrap;
    }
    .filter-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px 16px;
      background: #e3f2fd;
      border-radius: 8px;
      color: #1976d2;
      font-size: 0.9rem;
    }
    .orders-timeline {
      display: flex;
      flex-direction: column;
      gap: 32px;
      position: relative;
      margin-top: 16px;
    }
    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      position: relative;
    }
    .timeline-badge {
      min-width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #4f46e5 60%, #7c3aed 100%);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(79,70,229,0.08);
      margin-top: 8px;
    }
    .order-number {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .order-card {
      flex: 1;
      box-shadow: 0 2px 12px rgba(44,62,80,0.07);
      border-radius: 16px;
      border: 1px solid #ececec;
      transition: box-shadow 0.2s, transform 0.2s;
      background: #fff;
    }
    .order-card:hover {
      box-shadow: 0 8px 24px rgba(44,62,80,0.13);
      transform: translateY(-2px) scale(1.01);
    }
    .order-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #22223b;
    }
    .order-num {
      color: #7c3aed;
      font-weight: 700;
      margin-left: 2px;
    }
    .order-total {
      font-size: 1.1rem;
      font-weight: bold;
      color: #4caf50;
      background: #e8f5e9;
      padding: 4px 14px;
      border-radius: 8px;
      margin-left: 8px;
    }
    .order-meta {
      display: flex;
      gap: 18px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .order-meta span {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.97em;
      color: #555;
    }
    .restaurant-name {
      font-weight: 600;
      color: #4f46e5 !important;
      background: #f3f4f6;
      padding: 4px 12px;
      border-radius: 8px;
      margin-right: 8px;
    }
    .status-badge {
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      margin-left: 4px;
      background: #f3f4f6;
      color: #7c3aed;
      text-transform: capitalize;
    }
    .status-badge.closed {
      background: #ffeaea;
      color: #e53935;
    }
    .status-badge.open {
      background: #e8f5e9;
      color: #43a047;
    }
    .order-items {
      margin: 18px 0 0 0;
    }
    .items-list {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 12px 8px;
      margin-top: 6px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid #ececec;
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
      color: #22223b;
    }
    .item-quantity {
      background-color: #ede9fe;
      color: #7c3aed;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.9em;
      font-weight: bold;
      margin-left: 6px;
    }
    .item-price {
      font-weight: bold;
      color: #4caf50;
      min-width: 80px;
      text-align: right;
    }
    .item-notes {
      width: 100%;
      margin-top: 4px;
      color: #888;
    }
    .order-notes {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 18px;
      background: #f3f4f6;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.98em;
      color: #555;
    }
    .notes-icon {
      color: #7c3aed;
    }
    .notes-label {
      font-weight: 600;
      color: #22223b;
    }
    .notes-content {
      color: #555;
    }
    .group-order-info {
      background-color: #f5f5f5;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .group-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.97em;
      color: #444;
    }
    .group-info mat-icon {
      font-size: 18px;
      margin-right: 4px;
      color: #7c3aed;
    }
    .restaurant-info {
      color: #4f46e5 !important;
      font-weight: 500;
    }
    .empty-state {
      text-align: center;
      padding: 60px 0 40px 0;
      color: #888;
    }
    .large-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #bdbdbd;
      margin-bottom: 20px;
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @media (max-width: 900px) {
      .my-orders-wrapper {
        max-width: 100%;
        padding: 12px 2px;
      }
      .orders-timeline {
        gap: 18px;
      }
      .timeline-item {
        gap: 10px;
      }
    }
    @media (max-width: 600px) {
      .header-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .search-row {
        flex-direction: column;
        gap: 12px;
      }
      .search-field, .date-field {
        min-width: 100%;
      }
      .clear-btn {
        width: 100%;
      }
      .orders-timeline {
        gap: 10px;
      }
      .timeline-badge {
        min-width: 36px;
        height: 36px;
        font-size: 1rem;
      }
      .order-card {
        border-radius: 10px;
        padding: 0 2px;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  commandeDetails: { [key: string]: CommandeWithRestaurant } = {};
  isLoading = false;
  currentUserId: string = '';
  searchTerm: string = '';
  selectedDate: Date | null = null;
  filteredOrders: Order[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private commandeService: CommandeService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
        this.filteredOrders = [...this.orders]; // Initialize filtered orders
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
      this.commandeService.getCommandeWithRestaurantById(commandeId).subscribe({
        next: (commande) => {
          this.commandeDetails[commandeId] = commande;
          // Apply filters after each commande is loaded to update restaurant names
          this.applyFilters();
        },
        error: (error) => {
          console.error(`Error loading commande ${commandeId}:`, error);
        }
      });
    });
  }

  getCommandeInfo(commandeId: string): CommandeWithRestaurant | null {
    return this.commandeDetails[commandeId] || null;
  }

  getRestaurantName(commandeId: string): string | null {
    const commandeInfo = this.getCommandeInfo(commandeId);
    return commandeInfo?.restaurantName || null;
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
    const participationDurationMinutes = commandeInfo.participationDurationMinutes || 60; // Default to 60 minutes
    const participationEndTime = new Date(createdAt.getTime() + (participationDurationMinutes * 60 * 1000));

    return now < participationEndTime && (commandeInfo.allowParticipation ?? true);
  }

  canManageOrder(order: Order): boolean {
    return order.participantId === this.currentUserId;
  }

  loadOrdersForCommande(): void {
    this.loadMyOrders();
  }

  deleteOrder(order: Order): void {
    if (!this.canManageOrder(order)) {
      this.snackBar.open('You can only delete your own orders', 'Close', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '600px',
      data: { title: 'Delete Order', message: `Are you sure you want to delete ${order.participantName}'s order?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.deleteOrder(order.id).subscribe({
          next: () => {
            this.snackBar.open('Order deleted successfully', 'Close', { duration: 3000 });
            this.loadOrdersForCommande();
            this.updateCommandeTotalInDatabase(order.commandeId);
          },
          error: (error: any) => {
            console.error('Error deleting order:', error);
            this.snackBar.open('Error deleting order', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  updateCommandeTotalInDatabase(commandeId: string): void {
    this.orderService.getOrdersByCommandeId(commandeId).subscribe({
      next: (orders) => {
        const validOrders = orders.filter(order => !order.deleted);
        const newTotal = validOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
        this.commandeService.updateCommandeTotal(commandeId, newTotal).subscribe();
      },
      error: (error) => {
        console.error('Error updating commande total:', error);
      }
    });
  }


  viewDetails(commandeId: string): void {
    this.router.navigate(['/group-orders/details', commandeId]);
  }

  goBack(): void {
    window.history.back();
  }

  goToGroupOrders(): void {
    this.router.navigate(['/group-orders']);
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      // Check restaurant name from commande details
      const commandeInfo = this.getCommandeInfo(order.commandeId);
      const restaurantName = commandeInfo?.restaurantName || '';
      const matchesSearchTerm = this.searchTerm ?
        restaurantName.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;

      // Check date (considering only the date part, not time)
      const matchesDate = this.selectedDate ?
        new Date(order.createdAt).toDateString() === this.selectedDate.toDateString() : true;

      return matchesSearchTerm && matchesDate;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDate = null;
    this.applyFilters();
  }
}
