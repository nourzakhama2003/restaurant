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
import { ConfirmDialogComponent } from '../../generalconfirmation/confirm-dialog.component';
import { OrderSubmissionComponent } from '../order-submission/order-submission.component';
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { CountdownService } from '../../services/counttdown.service';
import { Subscription } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/websocket.service';
import { RouterModule } from '@angular/router'; // <-- Add this import

// Polyfill for 'global' in browser


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
    MatFormFieldModule,
    MatProgressBarModule,
    FormsModule,
    RouterModule
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
  userLoaded = false;
  ordersLoaded = false;
  userAndOrdersLoaded = false;
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
  orderSearchTerm: string = '';
  filteredOrders: Order[] = [];
  orderStatusFilter: string = 'cree';
  statusOptions: { value: string, label: string }[] = [
    { value: 'cree', label: 'Créée' },
    { value: 'attente', label: 'En attente' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'annulee', label: 'Annulée' },
  ];

  availableStatuses = [
    { value: 'created', label: 'Created' },
    { value: 'closed', label: 'Closed for Participation' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  statusUpdating = false;
  private pollingInterval: any;
  private wsSubscription: any;

  currentDate = new Date();

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
    private countdownService: CountdownService,
    private webSocketService: WebSocketService
  ) { }

  async ngOnInit(): Promise<void> {
    this.commandeId = this.route.snapshot.paramMap.get('id') || '';
    this.loadCurrentUser();
    if (this.commandeId) {
      this.loadGroupOrderDetails();
      // Subscribe to WebSocket updates (now async)
      const wsObservable = await this.webSocketService.connect(this.commandeId);
      this.wsSubscription = wsObservable.subscribe(() => {

        this.loadGroupOrderDetails();
        this.cdr.detectChanges();
      });
    } else {
      this.loading = false;
      this.snackBar.open('Invalid group order ID', 'Close', { duration: 3000 });
    }
    this.filteredOrders = this.orders;
    // Remove pollingInterval logic
    // this.pollingInterval = setInterval(() => {
    //   this.loadGroupOrderDetails();
    // }, 60000);
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.countdownService.stopCountdown(this.commandeId);
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUserId = user.id;
        this.userLoaded = true;
        this.checkUserAndOrdersLoaded();
        // If orders are already loaded, trigger change detection
        if (this.orders.length > 0) {
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error loading current user:', error);
        this.currentUserId = 'default-user-id';
        this.userLoaded = true;
        this.checkUserAndOrdersLoaded();
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
        // Parse date fields to JS Date objects for correct display
        if (commande.createdAt) commande.createdAt = new Date(commande.createdAt);
        if (commande.updatedAt) commande.updatedAt = new Date(commande.updatedAt);
        if (commande.orderDeadline) commande.orderDeadline = new Date(commande.orderDeadline);
        this.commande = commande;
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
          this.orderSearchTerm = '';
          this.applyOrderFilters();
          this.ordersLoaded = true;
          this.checkUserAndOrdersLoaded();
          // If currentUserId is already set, trigger change detection
          if (this.currentUserId) {
            this.cdr.detectChanges();
            // Debug log: check if currentUserId matches any participantId

          }
        },
        error: (error: any) => {
          console.error('Error loading orders:', error);
          this.orders = [];
          this.loading = false;
          this.ordersLoaded = true;
          this.checkUserAndOrdersLoaded();
          this.applyOrderFilters();
          this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
        }
      });
    }
  }

  checkUserAndOrdersLoaded(): void {
    this.userAndOrdersLoaded = this.userLoaded && this.ordersLoaded;
    if (this.userAndOrdersLoaded) {
      this.cdr.detectChanges();
    }
  }

  getTotalAmount(): number {
    if (this.commande && this.commande.totalPrice !== undefined) {
      return this.commande.totalPrice;
    }
    return this.orders.reduce((total: number, order: Order) => total + (order.totalAmount || 0), 0);
  }

  getOrderTotal(order: Order): number {
    return order.totalAmount || 0;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'cree': return 'primary';
      case 'attente': return 'accent';
      case 'confirmee': return 'warn';
      case 'annulee': return 'warn';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'cree': return 'hourglass_empty';
      case 'attente': return 'hourglass_top';
      case 'confirmee': return 'check_circle';
      case 'annulee': return 'cancel';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'cree': return 'Créée';
      case 'attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  }

  isCreator(): boolean {
    return this.commande?.creatorId === this.currentUserId;
  }

  canManageOrder(order: Order): boolean {
    // Only the creator of the group order or the creator of the order can manage
    return this.currentUserId === this.commande?.creatorId || this.currentUserId === order.participantId;
  }

  onStatusChange(newStatus: string): void {
    if (!this.commande || !this.isCreator()) {
      this.snackBar.open('Only the creator can change the status', 'Close', { duration: 3000 });
      return;
    }
    this.statusUpdating = true;
    this.commandeService.updateCommandeStatus(this.commandeId, newStatus).subscribe({
      next: () => {
        if (this.commande) {
          this.commande.status = newStatus;
          this.snackBar.open(`Status updated to ${newStatus}`, 'Close', { duration: 3000 });
          this.cdr.detectChanges();
          this.loadGroupOrderDetails(); // Reload details from backend
        }
        this.statusUpdating = false;
      },
      error: (error: any) => {
        console.error('Error updating status:', error);
        this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
        this.statusUpdating = false;
      }
    });
  }

  public onStatusChangeDropdown(event: Event): void {
    if (!this.commande) return;
    const newStatus = (event.target as HTMLSelectElement).value;

    this.onStatusChange(newStatus);
  }

  editOrder(order: Order): void {
    if (!this.canManageOrder(order)) {
      this.snackBar.open('You can only edit your own orders', 'Close', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(OrderSubmissionComponent, {
      width: '1500px',
      maxWidth: '100vw',
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
      width: '600px',
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
    if (!this.commande) {
      this.snackBar.open('Group order not found', 'Close', { duration: 3000 });
      return;
    }
    if (!this.currentUserId) {
      this.snackBar.open('User not loaded', 'Close', { duration: 3000 });
      return;
    }
    if (!this.canJoin()) {
      this.snackBar.open('Participation time has expired for this group order.', 'Close', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(OrderSubmissionComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: {
        commandeId: this.commandeId,
        restaurantId: this.commande.restaurantId,
        participantId: this.currentUserId // Pass the backend user id
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrdersForCommande();
        this.cdr.detectChanges();
        this.snackBar.open('Order submitted successfully!', 'Close', { duration: 3000 });
      }
    });
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

  getDeadlineProgress(createdAt: string | Date | null | undefined, orderDeadline: string | Date | null | undefined): number {
    if (!createdAt || !orderDeadline) return 0;
    const start = new Date(createdAt).getTime();
    const end = new Date(orderDeadline).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  getRestaurantName(restaurantId: string | null | undefined): string {
    if (!restaurantId) return 'Unknown Restaurant';
    if (this.restaurant && this.restaurant.id === restaurantId) {
      return this.restaurant.name || 'Unknown Restaurant';
    }
    return 'Unknown Restaurant';
  }

  applyOrderFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const participantName = order.participantName || '';
      return this.orderSearchTerm
        ? participantName.toLowerCase().includes(this.orderSearchTerm.toLowerCase())
        : true;
    });
  }

  clearOrderSearch(): void {
    this.orderSearchTerm = '';
    this.applyOrderFilters();
  }

  // When orders are loaded or changed, update filteredOrders
  setOrders(orders: Order[]): void {
    this.orders = orders;
    this.applyOrderFilters();
  }

  get myOrder(): Order | undefined {
    return this.orders.find(order => order.participantId === this.currentUserId);
  }

  canJoin(): boolean {
    // User can join if:
    // - orders and user are loaded
    // - user has not already joined
    // - commande status is 'cree' or 'attente'
    return this.userAndOrdersLoaded
      && !this.orders.some(order => order.participantId === this.currentUserId)
      && (this.commande?.status === 'cree' || this.commande?.status === 'attente');
  }

  toggleOrderPaid(order: Order, paid: boolean) {
    if (this.isCreator()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Confirmer le paiement',
          message: 'Êtes-vous sûr de vouloir changer le statut de paiement de cette commande ?',
          confirmLabel: 'Confirmer',
          confirmIcon: 'check_circle'
        }
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          const updatedOrder = { ...order, paye: paid };
          this.orderService.updateOrder(order.id, updatedOrder).subscribe({
            next: (res: any) => {
              order.paye = paid;
              this.snackBar.open('Statut de paiement mis à jour', 'Fermer', { duration: 2000 });
              this.loadGroupOrderDetails();
            },
            error: () => {
              this.snackBar.open('Erreur lors de la mise à jour du paiement', 'Fermer', { duration: 2000 });
            }
          });
        }
      });
    } else {
      const updatedOrder = { ...order, paye: paid };
      this.orderService.updateOrder(order.id, updatedOrder).subscribe({
        next: (res: any) => {
          order.paye = paid;
          this.snackBar.open('Statut de paiement mis à jour', 'Fermer', { duration: 2000 });
          this.loadGroupOrderDetails();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la mise à jour du paiement', 'Fermer', { duration: 2000 });
        }
      });
    }
  }

  /**
   * Print the order details for restaurant
   */
  printOrderDetails() {
    // Show print section
    const printSection = document.getElementById('printSection');
    if (printSection) {
      printSection.style.display = 'block';
    }

    // Wait a moment for the content to render, then print
    setTimeout(() => {
      window.print();

      // Hide print section after printing
      setTimeout(() => {
        if (printSection) {
          printSection.style.display = 'none';
        }
      }, 1000);
    }, 100);
  }

  /**
   * Get total number of items across all orders
   */
  getTotalItems(): number {
    if (!this.orders) return 0;

    return this.orders.reduce((total, order) => {
      if (order.items) {
        return total + order.items.reduce((itemTotal, item) => {
          return itemTotal + (item.quantity || 0);
        }, 0);
      }
      return total;
    }, 0);
  }

  /**
   * Get count of orders that have items
   */
  getOrdersWithItemsCount(): number {
    if (!this.orders) return 0;
    return this.orders.filter(order => order.items && order.items.length > 0).length;
  }
}