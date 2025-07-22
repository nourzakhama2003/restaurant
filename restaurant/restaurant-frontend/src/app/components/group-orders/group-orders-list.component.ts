import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-group-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
  ],
  templateUrl: './group-orders-list.component.html',
  styleUrls: ['./group-orders-list.component.css']
})
export class GroupOrdersListComponent implements OnInit, OnDestroy {
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  restaurants: Restaurant[] = [];
  selectedRestaurantId: string = '';
  restaurantSearchControl = new FormControl('');
  filteredRestaurants: Observable<Restaurant[]> = new Observable();
  orderCounts: { [commandeId: string]: number } = {};
  orderTotals: { [commandeId: string]: number } = {};
  isLoading = false;
  countdowns: { [commandeId: string]: { display: string, color: string, subscription: Subscription | null } } = {};
  selectedDate: Date | null = null;
  currentUserId: string = '';
  // Added for My Orders style filters
  searchTerm: string = '';

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
    // Set currentUserId from localStorage or user service
    this.currentUserId = localStorage.getItem('userId') || '';
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
        this.setupRestaurantFilter();
      },
      error: (error: any) => {
        console.error('Error loading restaurants:', error);
      }
    });
  }

  private setupRestaurantFilter(): void {
    this.filteredRestaurants = this.restaurantSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRestaurants(value || ''))
    );
  }

  private _filterRestaurants(value: string | Restaurant): Restaurant[] {
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value && typeof value === 'object' && 'name' in value) {
      filterValue = (value.name || '').toLowerCase();
    }
    return this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(filterValue) ||
      (restaurant.cuisineType && restaurant.cuisineType.toLowerCase().includes(filterValue))
    );
  }

  onRestaurantSelected(restaurant: Restaurant): void {
    this.selectedRestaurantId = restaurant.id || '';
    this.restaurantSearchControl.setValue(restaurant.name || '');
    this.filterByRestaurant();
  }

  displayRestaurantFn = (restaurant: any): string => {
    console.log('displayWith:', restaurant);
    if (!restaurant) return '';
    if (typeof restaurant === 'string') return restaurant;
    const name = restaurant.name || '';
    const cuisine = restaurant.cuisineType || '';
    if (name && cuisine) return `${name} - ${cuisine}`;
    if (name) return name;
    if (cuisine) return cuisine;
    return '';
  }

  onSearchInput(): void {
    const value = this.restaurantSearchControl.value;
    if (!value) {
      this.selectedRestaurantId = '';
      this.filterByRestaurant();
      return;
    }
    // If value is a string and matches a restaurant, set the control to the object
    if (typeof value === 'string') {
      const match = this.restaurants.find(r => r.name.toLowerCase() === value.toLowerCase());
      if (match) {
        this.restaurantSearchControl.setValue(match as any); // allow Restaurant type
        this.selectedRestaurantId = match?.id || '';
        this.filterByRestaurant();
        return;
      }
    }
    // Otherwise, do not change selection
  }

  clearRestaurantFilter(): void {
    this.selectedRestaurantId = '';
    this.restaurantSearchControl.setValue('');
    this.filterByRestaurant();
  }

  onDateChange(event: any): void {
    this.selectedDate = event.value;
    this.filterByRestaurant();
  }

  clearDateFilter(): void {
    this.selectedDate = null;
    this.filterByRestaurant();
  }

  loadAllCommandes(): void {
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes: Commande[]) => {
        this.commandes = commandes;
        this.filteredCommandes = [...this.commandes];
        this.setupCountdowns();
        this.loadOrderCounts(); // <-- Ensure counts and totals are updated after loading commandes
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
    let filtered = this.commandes;
    if (this.selectedRestaurantId) {
      filtered = filtered.filter(c => c.restaurantId === this.selectedRestaurantId);
    }
    if (this.selectedDate) {
      const selected = new Date(this.selectedDate);
      selected.setHours(0, 0, 0, 0);
      filtered = filtered.filter(c => {
        const created = new Date(c.createdAt);
        created.setHours(0, 0, 0, 0);
        return created.getTime() === selected.getTime();
      });
    }
    this.filteredCommandes = [...filtered];
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

  getOrderProgress(createdAt: string | Date, orderDeadline: string | Date): number {
    if (!createdAt || !orderDeadline) return 0;
    const start = new Date(createdAt).getTime();
    const end = new Date(orderDeadline).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  editOrder(commandeId: string): void {
    this.router.navigate(['/group-orders/edit', commandeId]);
  }

  applyFilters(): void {
    this.filteredCommandes = this.commandes.filter(commande => {
      // Filter by restaurant name
      const restaurantName = this.getRestaurantName(commande.restaurantId) || '';
      const matchesSearchTerm = this.searchTerm
        ? restaurantName.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      // Filter by date (createdAt)
      const matchesDate = this.selectedDate
        ? new Date(commande.createdAt).toLocaleDateString() === new Date(this.selectedDate).toLocaleDateString()
        : true;
      return matchesSearchTerm && matchesDate;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDate = null;
    this.applyFilters();
  }
}