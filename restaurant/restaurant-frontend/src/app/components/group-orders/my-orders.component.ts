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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';

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
    FormsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: "./my-orders.component.html",
  styleUrls: ["./my-orders.component.css"],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  commandeDetails: { [key: string]: CommandeWithRestaurant } = {};
  isLoading = false;
  currentUserId: string = '';
  searchTerm: string = '';
  selectedDate: Date | null = null;
  filteredOrders: Order[] = [];
  statusFilter: string = 'cree';
  statusOptions: { value: string, label: string }[] = [
    { value: 'cree', label: 'Créée' },
    { value: 'attente', label: 'En attente' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'annulee', label: 'Annulée' },
  ];

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
    return new Date(date).toLocaleDateString('fr-FR');
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
      const commandeInfo = this.getCommandeInfo(order.commandeId);
      const restaurantName = commandeInfo?.restaurantName || '';
      const matchesSearchTerm = this.searchTerm ?
        restaurantName.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
      const matchesDate = this.selectedDate ?
        new Date(order.createdAt).toLocaleDateString() === new Date(this.selectedDate).toLocaleDateString() : true;
      // By default, only show 'cree'. Dropdown allows other statuses.
      const matchesStatus = commandeInfo?.status?.toLowerCase() === this.statusFilter;
      return matchesSearchTerm && matchesDate && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDate = null;
    this.statusFilter = 'cree';
    this.applyFilters();
  }

  // New methods for enhanced UI
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
}
