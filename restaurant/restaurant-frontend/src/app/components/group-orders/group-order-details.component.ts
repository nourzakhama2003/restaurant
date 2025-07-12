import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CommandeService, Commande } from '../../services/commande.service';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { Order } from '../../models/group-order.model';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';
import { OrderSubmissionComponent } from '../order-submission/order-submission.component';

@Component({
    selector: 'app-group-order-details',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatDividerModule,
        MatSelectModule,
        MatFormFieldModule
    ],
    template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <mat-card *ngIf="!loading && commande">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>restaurant</mat-icon>
                Group Order Details
              </mat-card-title>
              <mat-card-subtitle>
                Created by {{commande.creatorName}} • 
                {{commande.createdAt | date:'short'}}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <!-- Order Status Management -->
              <div class="mb-3" *ngIf="isCreator()">
                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select [value]="commande.status" (selectionChange)="onStatusChange($event.value)">
                    <mat-option *ngFor="let status of availableStatuses" [value]="status.value">
                      {{status.label}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Order Status (Read-only for non-creators) -->
              <div class="mb-3" *ngIf="!isCreator()">
                <mat-chip-set>
                  <mat-chip [color]="getStatusColor(commande.status)" selected>
                    {{commande.status.replace('_', ' ')}}
                  </mat-chip>
                </mat-chip-set>
              </div>

              <!-- Restaurant Info -->
              <div class="mb-4">
                <h3>Restaurant Information</h3>
                <p><strong>Restaurant ID:</strong> {{commande.restaurantId}}</p>
                <p><strong>Delivery Address:</strong> {{commande.deliveryAddress}}</p>
                <p><strong>Delivery Phone:</strong> {{commande.deliveryPhone}}</p>
              </div>

              <mat-divider></mat-divider>

              <!-- Order Summary -->
              <div class="my-4">
                <h3>Order Summary</h3>
                <p><strong>Total Participants:</strong> {{orders?.length || 0}}</p>
                <p><strong>Total Amount:</strong> \${{getTotalAmount() | number:'1.2-2'}}</p>
              </div>

              <mat-divider></mat-divider>

              <!-- Individual Orders -->
              <div class="my-4" *ngIf="orders && orders.length > 0">
                <h3>Individual Orders ({{orders.length}})</h3>
                <div class="row">
                  <div class="col-md-6 mb-3" *ngFor="let order of orders">
                    <mat-card class="order-card">
                      <mat-card-header>
                        <mat-card-title class="text-sm">{{order.participantName}}</mat-card-title>
                        <mat-card-subtitle>
                          Phone: {{order.participantPhone}} • {{order.items?.length || 0}} items
                        </mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <div *ngFor="let item of order.items" class="item-row">
                          <div class="d-flex justify-content-between align-items-center">
                            <span>{{item.menuItemName}}</span>
                            <div>
                              <span class="quantity">×{{item.quantity}}</span>
                              <span class="price ms-2">\${{item.unitPrice * item.quantity | number:'1.2-2'}}</span>
                            </div>
                          </div>
                          <div *ngIf="item.notes" class="text-muted small">
                            Note: {{item.notes}}
                          </div>
                        </div>
                        <mat-divider class="my-2"></mat-divider>
                        <div class="d-flex justify-content-between">
                          <strong>Subtotal:</strong>
                          <strong>\${{order.totalAmount | number:'1.2-2'}}</strong>
                        </div>
                        <div *ngIf="order.notes" class="mt-2">
                          <strong>Order Notes:</strong> {{order.notes}}
                        </div>
                      </mat-card-content>
                      
                      <!-- Order Management Actions -->
                      <mat-card-actions *ngIf="canManageOrder(order)" align="end">
                        <button mat-button color="primary" (click)="editOrder(order)">
                          <mat-icon>edit</mat-icon>
                          Edit
                        </button>
                        <button mat-button color="warn" (click)="deleteOrder(order)">
                          <mat-icon>delete</mat-icon>
                          Delete
                        </button>
                      </mat-card-actions>
                    </mat-card>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="!orders || orders.length === 0" class="text-center py-4">
                <mat-icon class="large-icon text-muted">shopping_cart</mat-icon>
                <p class="text-muted">No orders yet</p>
                <p class="text-muted">Share the group order link to let others join!</p>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
                Back to Group Orders
              </button>
              
              <button 
                mat-raised-button 
                color="primary" 
                *ngIf="commande.status === 'OPEN_FOR_PARTICIPATION' && !isCreator()"
                (click)="participateInOrder()">
                <mat-icon>add_shopping_cart</mat-icon>
                Join This Order
              </button>
              
              <!-- Creator-only buttons -->
              <div *ngIf="isCreator()">
                <button 
                  mat-raised-button 
                  color="accent" 
                  *ngIf="commande.status === 'OPEN_FOR_PARTICIPATION'"
                  (click)="onStatusChange('CLOSED_FOR_PARTICIPATION')">
                  <mat-icon>close</mat-icon>
                  Close for Participation
                </button>
                
                <button 
                  mat-raised-button 
                  color="primary" 
                  *ngIf="commande.status === 'CLOSED_FOR_PARTICIPATION'"
                  (click)="onStatusChange('CONFIRMED')">
                  <mat-icon>check</mat-icon>
                  Confirm Order
                </button>
                
                <button 
                  mat-raised-button 
                  color="warn" 
                  *ngIf="commande.status !== 'CANCELLED'"
                  (click)="onStatusChange('CANCELLED')">
                  <mat-icon>cancel</mat-icon>
                  Cancel Order
                </button>
              </div>
            </mat-card-actions>
          </mat-card>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
            <p class="mt-3">Loading group order details...</p>
          </div>

          <!-- Error State -->
          <mat-card *ngIf="!loading && !commande">
            <mat-card-content class="text-center py-4">
              <mat-icon class="large-icon text-danger">error</mat-icon>
              <h3>Group Order Not Found</h3>
              <p>The requested group order could not be found.</p>
              <button mat-raised-button color="primary" (click)="goBack()">
                Back to Group Orders
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .container-fluid {
      padding: 20px;
    }
    
    .order-card {
      height: 100%;
    }
    
    .item-row {
      margin-bottom: 8px;
    }
    
    .quantity {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8em;
    }
    
    .price {
      font-weight: 500;
    }
    
    .large-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    
    mat-card-header mat-card-title {
      margin-bottom: 8px;
    }
    
    mat-chip {
      font-weight: 500;
    }
  `]
})
export class GroupOrderDetailsComponent implements OnInit {
    commande: Commande | null = null;
    orders: Order[] = [];
    loading = true;
    commandeId: string = '';
    currentUserId: string = '';
    availableStatuses = [
        { value: 'OPEN_FOR_PARTICIPATION', label: 'Open for Participation' },
        { value: 'CLOSED_FOR_PARTICIPATION', label: 'Closed for Participation' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private commandeService: CommandeService,
        private orderService: OrderService,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.commandeId = this.route.snapshot.paramMap.get('id') || '';
        this.loadCurrentUser();
        if (this.commandeId) {
            this.loadGroupOrderDetails();
        } else {
            this.loading = false;
        }
    }

    loadCurrentUser(): void {
        this.userService.getCurrentUser().subscribe({
            next: (user: any) => {
                this.currentUserId = user.id;
            },
            error: (error: any) => {
                console.error('Error loading current user:', error);
                // For development, you might want to set a default user ID
                // this.currentUserId = 'default-user-id';
            }
        });
    }

    loadGroupOrderDetails(): void {
        this.loading = true;
        this.commandeService.getCommandeById(this.commandeId).subscribe({
            next: (commande: Commande) => {
                this.commande = commande;
                console.log('Loaded commande:', commande);
                // Load individual orders for this commande
                this.loadOrdersForCommande();
            },
            error: (error: any) => {
                console.error('Error loading group order details:', error);
                this.loading = false;
            }
        });
    }

    loadOrdersForCommande(): void {
        if (this.commandeId) {
            console.log('Loading orders for commande ID:', this.commandeId);
            this.orderService.getOrdersByCommandeId(this.commandeId).subscribe({
                next: (orders: Order[]) => {
                    console.log('Loaded orders:', orders);
                    this.orders = orders.filter(order => !order.deleted);
                    // Add orders to commande for display
                    if (this.commande) {
                        this.commande.orders = this.orders;
                    }
                    this.loading = false;
                },
                error: (error: any) => {
                    console.error('Error loading orders for commande:', error);
                    this.orders = [];
                    this.loading = false;
                }
            });
        } else {
            this.loading = false;
        }
    }

    getTotalAmount(): number {
        if (!this.orders) return 0;
        return this.orders.reduce((total: number, order: Order) => {
            return total + order.totalAmount;
        }, 0);
    }

    getOrderTotal(order: Order): number {
        return order.totalAmount || 0;
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

    isCreator(): boolean {
        return this.commande?.creatorId === this.currentUserId;
    }

    canManageOrder(order: Order): boolean {
        // Creator can manage all orders, participants can only manage their own
        return this.isCreator() || order.participantId === this.currentUserId;
    }

    onStatusChange(newStatus: string): void {
        if (!this.commande || !this.isCreator()) {
            this.snackBar.open('Only the creator can change the status', 'Close', { duration: 3000 });
            return;
        }

        const updatedCommande = { ...this.commande, status: newStatus };
        this.commandeService.updateCommande(this.commandeId, updatedCommande).subscribe({
            next: (updated: Commande) => {
                this.commande = updated;
                this.snackBar.open(`Status updated to ${newStatus}`, 'Close', { duration: 3000 });
            },
            error: (error: any) => {
                console.error('Error updating status:', error);
                this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
            }
        });
    }

    editOrder(order: Order): void {
        if (!this.canManageOrder(order)) {
            this.snackBar.open('You can only edit your own orders', 'Close', { duration: 3000 });
            return;
        }

        // Open the order submission dialog in edit mode
        const dialogRef = this.dialog.open(OrderSubmissionComponent, {
            width: '1000px',
            data: {
                commandeId: this.commandeId,
                restaurantId: this.commande?.restaurantId,
                editMode: true,
                existingOrder: order
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open('Order updated successfully', 'Close', { duration: 3000 });
                this.loadOrdersForCommande(); // Refresh orders
            }
        });
    }

    deleteOrder(order: Order): void {
        if (!this.canManageOrder(order)) {
            this.snackBar.open('You can only delete your own orders', 'Close', { duration: 3000 });
            return;
        }

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            data: {
                title: 'Delete Order',
                message: `Are you sure you want to delete ${order.participantName}'s order?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.orderService.deleteOrder(order.id).subscribe({
                    next: () => {
                        this.snackBar.open('Order deleted successfully', 'Close', { duration: 3000 });
                        this.loadOrdersForCommande(); // Refresh orders
                    },
                    error: (error: any) => {
                        console.error('Error deleting order:', error);
                        this.snackBar.open('Error deleting order', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }

    participateInOrder(): void {
        this.router.navigate(['/group-orders/participate', this.commandeId]);
    }

    goBack(): void {
        this.router.navigate(['/group-orders']);
    }
}
