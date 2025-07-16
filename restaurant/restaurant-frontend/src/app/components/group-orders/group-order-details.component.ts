import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { CountdownService } from '../../services/counttdown.service';
import { Subscription } from 'rxjs';

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
  templateUrl: './group-order-details.component.html',
  styleUrls: ['./group-order-details.component.css']
})
export class GroupOrderDetailsComponent implements OnInit, OnDestroy {
  commande: Commande | null = null;
  orders: Order[] = [];
  loading = true;
  commandeId: string = '';
  currentUserId: string = '';
  restaurant: Restaurant = {
    id: '',
    name: 'Unknown Restaurant',
    description: '',
    address: '',
    phone: '',
    cuisineType: ''
  };
  countdownDisplay: string = 'Calculating...';
  countdownColor: string = 'time-normal';
  private countdownSubscription: Subscription | null = null;

  availableStatuses = [
    { value: 'created', label: 'Created' },
    { value: 'closed', label: 'Closed for Participation' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private orderService: OrderService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private restaurantService: RestaurantService,
    private cdr: ChangeDetectorRef,
    private countdownService: CountdownService
  ) { }

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.paramMap.get('id') || '';
    this.loadCurrentUser();
    if (this.commandeId) {
      this.loadGroupOrderDetails();
    } else {
      this.loading = false;
      this.snackBar.open('Invalid group order ID', 'Close', { duration: 3000 });
    }
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.countdownService.stopCountdown(this.commandeId);
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUserId = user.id;
      },
      error: (error: any) => {
        console.error('Error loading current user:', error);
        this.currentUserId = 'default-user-id';
        this.snackBar.open('Error loading user information', 'Close', { duration: 3000 });
      }
    });
  }

  loadRestaurantDetails(): void {
    if (this.commande?.restaurantId) {
      this.restaurantService.getRestaurantById(this.commande.restaurantId).subscribe({
        next: (restaurant: Restaurant) => {
          this.restaurant = restaurant;
        },
        error: (error: any) => {
          console.error('Error loading restaurant:', error);
          this.restaurant = {
            id: '',
            name: 'Restaurant information unavailable',
            description: '',
            address: '',
            phone: '',
            cuisineType: ''
          };
          this.snackBar.open('Error loading restaurant details', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.restaurant = {
        id: '',
        name: 'Restaurant information unavailable',
        description: '',
        address: '',
        phone: '',
        cuisineType: ''
      };
    }
  }

  loadGroupOrderDetails(): void {
    this.loading = true;
    this.commandeService.getCommandeById(this.commandeId).subscribe({
      next: (commande: Commande) => {
        this.commande = commande || {
          id: this.commandeId,
          restaurantId: '',
          creatorId: '',
          creatorName: '',
          status: 'created',
          totalPrice: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          orderDeadline: new Date(),
          participationDurationMinutes: 0,
          allowParticipation: false,
          orders: []
        };
        this.loadRestaurantDetails();
        this.loadOrdersForCommande();
        if (this.commande) {
          this.countdownSubscription = this.countdownService.startCountdown(this.commande).subscribe(countdown => {
            this.countdownDisplay = countdown.display;
            this.countdownColor = countdown.color;
            this.cdr.detectChanges();
          });
        }
      },
      error: (error: any) => {
        console.error('Error loading group order details:', error);
        this.commande = {
          id: this.commandeId,
          restaurantId: '',
          creatorId: '',
          creatorName: '',
          status: 'ERROR',
          totalPrice: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          orderDeadline: new Date(),
          orders: []
        };
        this.loading = false;
        this.snackBar.open('Error loading group order', 'Close', { duration: 3000 });
      }
    });
  }

  loadOrdersForCommande(): void {
    if (this.commandeId) {
      this.orderService.getOrdersByCommandeId(this.commandeId).subscribe({
        next: (orders: Order[]) => {
          this.orders = orders.filter(order => !order.deleted);
          if (this.commande) {
            this.commande.orders = this.orders;
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error loading orders for commande:', error);
          this.orders = [];
          this.loading = false;
          this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getTotalAmount(): number {
    return this.orders.reduce((total: number, order: Order) => total + (order.totalAmount || 0), 0);
  }

  getOrderTotal(order: Order): number {
    return order.totalAmount || 0;
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'created': return 'primary';
      case 'closed': return 'accent';
      case 'confirmed': return 'primary';
      case 'cancelled': return 'warn';
      default: return 'primary';
    }
  }

  isCreator(): boolean {
    return this.commande?.creatorId === this.currentUserId;
  }

  canManageOrder(order: Order): boolean {
    return this.isCreator() || order.participantId === this.currentUserId;
  }

  onStatusChange(newStatus: string): void {
    if (!this.commande || !this.isCreator()) {
      this.snackBar.open('Only the creator can change the status', 'Close', { duration: 3000 });
      return;
    }
    this.commandeService.updateCommandeStatus(this.commandeId, newStatus).subscribe({
      next: () => {
        if (this.commande) {
          this.commande.status = newStatus;
          this.snackBar.open(`Status updated to ${newStatus}`, 'Close', { duration: 3000 });
          this.cdr.detectChanges();
        }
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
    const dialogRef = this.dialog.open(OrderSubmissionComponent, {
      width: '1000px',
      maxWidth: '95vw',
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
        this.loadOrdersForCommande();
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
      data: { title: 'Delete Order', message: `Are you sure you want to delete ${order.participantName}'s order?` }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.deleteOrder(order.id).subscribe({
          next: () => {
            this.snackBar.open('Order deleted successfully', 'Close', { duration: 3000 });
            this.loadOrdersForCommande();
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
    if (this.isPastDeadline()) {
      this.snackBar.open('Participation is closed for this order', 'Close', { duration: 3000 });
      return;
    }
    this.router.navigate(['/group-orders/participate', this.commandeId]);
  }

  goBack(): void {
    this.router.navigate(['/group-orders']);
  }

  isPastDeadline(): boolean {
    if (!this.commande || !this.commande.orderDeadline) return true;
    const now = new Date().getTime();
    const deadline = new Date(this.commande.orderDeadline).getTime();
    return now >= deadline;
  }
}