import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommandeService, Commande } from '../../services/commande.service';
import { RestaurantService } from '../../services/restaurant.service';
import { OrderService } from '../../services/order.service';
import { Restaurant } from '../../models/restaurant.model';
import { OrderSubmissionComponent } from '../order-submission/order-submission.component';
import { forkJoin } from 'rxjs';
import { CountdownService } from '../../services/counttdown.service';
import { Subscription } from 'rxjs';

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
  templateUrl: './group-orders-list.component.html',
  styleUrls: ['./group-orders-list.component.css']
})
export class GroupOrdersListComponent implements OnInit, OnDestroy {
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  restaurants: Restaurant[] = [];
  selectedRestaurantId: string = '';
  orderCounts: { [commandeId: string]: number } = {};
  orderTotals: { [commandeId: string]: number } = {};
  countdowns: { [commandeId: string]: { display: string, color: string, subscription: Subscription | null } } = {};

  constructor(
    private commandeService: CommandeService,
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private countdownService: CountdownService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadRestaurants();
    this.loadAllCommandes();
  }

  ngOnDestroy(): void {
    Object.entries(this.countdowns).forEach(([commandeId, c]) => {
      if (c.subscription) c.subscription.unsubscribe();
      this.countdownService.stopCountdown(commandeId);
    });
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
    const orderCountRequests = this.commandes.map(commande =>
      this.orderService.getOrdersByCommandeId(commande.id)
    );

    if (orderCountRequests.length > 0) {
      forkJoin(orderCountRequests).subscribe({
        next: (orderArrays: any[][]) => {
          orderArrays.forEach((orders, index) => {
            const commandeId = this.commandes[index].id;
            const validOrders = orders.filter(order => !order.deleted);
            this.orderCounts[commandeId] = validOrders.length;
            this.orderTotals[commandeId] = this.calculateCommandeTotal(validOrders);
            this.commandes[index].totalPrice = this.orderTotals[commandeId];
          });
          this.filterByRestaurant();
        },
        error: (error: any) => {
          console.error('Error loading order counts:', error);
        }
      });
    }
  }

  calculateCommandeTotal(orders: any[]): number {
    return orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  }

  getParticipantCount(commandeId: string): number {
    return this.orderCounts[commandeId] || 0;
  }

  getCommandeTotal(commandeId: string): number {
    return this.orderTotals[commandeId] || 0;
  }

  filterByRestaurant(): void {
    if (this.selectedRestaurantId) {
      this.filteredCommandes = this.commandes.filter(c => c.restaurantId === this.selectedRestaurantId);
    } else {
      this.filteredCommandes = [...this.commandes];
    }
    this.setupCountdowns();
  }

  getRestaurantName(restaurantId: string): string {
    const restaurant = this.restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'Unknown Restaurant';
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  }

  createGroupOrder(): void {
    this.router.navigate(['/group-orders/create']);
  }

  goToMyOrders(): void {
    this.router.navigate(['/group-orders/my-orders']);
  }

  viewDetails(commandeId: string): void {
    this.router.navigate(['/group-orders/details', commandeId]);
  }

  participateInOrder(commandeId: string): void {
    // Find the commande to get restaurantId
    const commande = this.commandes.find(c => c.id === commandeId);
    if (!commande) {
      this.snackBar.open('Group order not found', 'Close', { duration: 3000 });
      return;
    }

    // Check if participation is still open
    if (!this.canParticipate(commande)) {
      this.snackBar.open('Participation time has expired for this group order.', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(OrderSubmissionComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: {
        commandeId: commandeId,
        restaurantId: commande.restaurantId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Order was submitted successfully
        this.snackBar.open('Order submitted successfully!', 'Close', { duration: 3000 });
        // Refresh the commandes to show updated orders
        this.loadAllCommandes();
      }
    });
  }

  isParticipationExpired(commande: Commande): boolean {
    if (!commande.orderDeadline) return false;
    const now = new Date().getTime();
    const deadline = new Date(commande.orderDeadline).getTime();
    return now >= deadline;
  }

  canParticipate(commande: Commande): boolean {
    return commande.status === 'created' && !this.isParticipationExpired(commande);
  }

  setupCountdowns(): void {
    // Unsubscribe previous subscriptions and stop countdowns
    Object.entries(this.countdowns).forEach(([commandeId, c]) => {
      if (c.subscription) c.subscription.unsubscribe();
      this.countdownService.stopCountdown(commandeId);
    });
    this.countdowns = {};

    this.filteredCommandes.forEach(commande => {
      // Initialize with default value first
      this.countdowns[commande.id] = { display: 'Calculating...', color: 'time-normal', subscription: null };
      const subscription = this.countdownService.startCountdown(commande).subscribe(countdown => {
        this.countdowns[commande.id].display = countdown.display;
        this.countdowns[commande.id].color = countdown.color;
        this.cdr.detectChanges();
      });
      this.countdowns[commande.id].subscription = subscription;
    });
  }

  getCountdownDisplay(commandeId: string): string {
    return this.countdowns[commandeId]?.display || 'No deadline';
  }

  getCountdownColor(commandeId: string): string {
    return this.countdowns[commandeId]?.color || 'time-normal';
  }
}