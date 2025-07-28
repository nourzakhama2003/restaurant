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
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user.service';
import { trigger, transition, style, animate } from '@angular/animations';

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
    MatTooltipModule,
  ],
  templateUrl: './group-orders-list.component.html',
  styleUrls: ['./group-orders-list.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
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
  selectedDate: string | null = null;
  currentUserId: string = '';
  // Added for My Orders style filters
  searchTerm: string = '';
  statusFilter: string = 'cree';
  statusOptions: { value: string, label: string }[] = [
    { value: 'cree', label: 'Créée' },
    { value: 'attente', label: 'En attente' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'annulee', label: 'Annulée' },
    { value: 'all', label: 'Tous les statuts' },
  ];
  // Remove userOrders map and related logic
  joinedCommandes: Set<string> = new Set();

  constructor(
    private commandeService: CommandeService,
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private countdownService: CountdownService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.statusFilter = 'cree';
        this.loadRestaurants();
        this.loadAllCommandes();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up countdown subscriptions
    Object.values(this.countdowns).forEach(countdown => {
      if (countdown.subscription) {
        countdown.subscription.unsubscribe();
      }
    });
  }

  loadRestaurants(): void {
    this.restaurantService.getAllRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.setupRestaurantFilter();
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.snackBar.open('Erreur lors du chargement des restaurants', 'Fermer', { duration: 3000 });
      }
    });
  }

  private setupRestaurantFilter(): void {
    this.filteredRestaurants = this.restaurantSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRestaurants(value))
    );
  }

  private _filterRestaurants(value: string | Restaurant | null): Restaurant[] {
    if (!value) return this.restaurants;
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase();
    return this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(filterValue)
    );
  }

  onRestaurantSelected(restaurant: Restaurant): void {
    this.selectedRestaurantId = restaurant.id || '';
    this.filterByRestaurant();
  }

  displayRestaurantFn = (restaurant: any): string => {
    return restaurant && restaurant.name ? restaurant.name : '';
  }

  onSearchInput(): void {
    const searchValue = this.restaurantSearchControl.value;
    if (typeof searchValue === 'string' && searchValue.trim() === '') {
      this.selectedRestaurantId = '';
      this.applyFilters();
    }
  }

  clearRestaurantFilter(): void {
    this.restaurantSearchControl.setValue('');
    this.selectedRestaurantId = '';
    this.applyFilters();
  }

  onDateChange(): void {
    this.applyFilters();
  }

  clearDateFilter(): void {
    this.selectedDate = null;
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  loadAllCommandes(): void {
    this.isLoading = true;
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes) => {
        console.log('📦 Loaded commandes:', commandes.length);
        console.log('📊 Status distribution:', commandes.reduce((acc, cmd) => {
          acc[cmd.status] = (acc[cmd.status] || 0) + 1;
          return acc;
        }, {} as any));

        this.commandes = commandes;
        this.loadOrderCounts();
        this.setupCountdowns();
        this.checkJoinedCommandes();
        this.applyFilters(); // Apply initial filters after loading
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading commandes:', error);
        this.snackBar.open('Erreur lors du chargement des commandes', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadOrderCounts(): void {
    const countPromises = this.commandes.map(commande =>
      this.orderService.getOrdersByCommandeId(commande.id).toPromise()
    );

    Promise.all(countPromises).then(orderArrays => {
      orderArrays.forEach((orders, index) => {
        if (orders) {
          const commandeId = this.commandes[index].id;
          this.orderCounts[commandeId] = orders.length;
          this.orderTotals[commandeId] = this.calculateCommandeTotal(orders);
        }
      });
    });
  }

  calculateCommandeTotal(orders: any[]): number {
    return orders.reduce((total, order) => total + (order.total || 0), 0);
  }

  getParticipantCount(commandeId: string): number {
    return this.orderCounts[commandeId] || 0;
  }

  getCommandeTotal(commandeId: string): number {
    const commande = this.commandes.find(c => c.id === commandeId);
    if (commande && commande.totalPrice !== undefined) {
      return commande.totalPrice;
    }
    return this.orderTotals[commandeId] || 0;
  }

  filterByRestaurant(): void {
    this.applyFilters();
  }

  getRestaurantName(restaurantId: string): string {
    const restaurant = this.restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'Restaurant inconnu';
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  createGroupOrder(): void {
    console.log('🚀 Create Group Order button clicked');
    this.router.navigate(['/group-orders/create']);
  }

  goToMyOrders(): void {
    console.log('📋 My Orders button clicked');
    this.router.navigate(['/group-orders/my-orders']);
  }

  viewDetails(commandeId: string): void {
    console.log('👁️ View Details button clicked for commande:', commandeId);
    this.router.navigate(['/group-orders/details', commandeId]);
  }

  participateInOrder(commandeId: string): void {
    const commande = this.commandes.find(c => c.id === commandeId);
    if (!commande) {
      this.snackBar.open('Commande non trouvée', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.isParticipationExpired(commande)) {
      this.snackBar.open('La participation à cette commande a expiré', 'Fermer', { duration: 3000 });
      return;
    }

    if (!this.canParticipate(commande)) {
      this.snackBar.open('Vous ne pouvez pas participer à cette commande', 'Fermer', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(OrderSubmissionComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        commandeId: commandeId,
        restaurantId: commande.restaurantId,
        restaurantName: this.getRestaurantName(commande.restaurantId)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Commande ajoutée avec succès', 'Fermer', { duration: 3000 });
        this.loadAllCommandes();
      }
    });
  }

  isParticipationExpired(commande: Commande): boolean {
    const now = new Date();
    const deadline = new Date(commande.orderDeadline);
    return now > deadline;
  }

  canParticipate(commande: Commande): boolean {
    return commande.status === 'cree' && !this.hasJoined(commande.id);
  }

  setupCountdowns(): void {
    this.commandes.forEach(commande => {
      if (this.countdowns[commande.id]?.subscription) {
        this.countdowns[commande.id].subscription?.unsubscribe();
      }

      this.countdowns[commande.id] = {
        display: '',
        color: '',
        subscription: null
      };

      // Use the existing countdown service method
      this.countdowns[commande.id].subscription = this.countdownService.startCountdown(commande).subscribe(
        (countdown: any) => {
          this.countdowns[commande.id].display = countdown.display;
          this.countdowns[commande.id].color = countdown.color;
          this.cdr.detectChanges();
        }
      );
    });
  }

  getCountdownDisplay(commandeId: string): string {
    return this.countdowns[commandeId]?.display || '';
  }

  getCountdownColor(commandeId: string): string {
    return this.countdowns[commandeId]?.color || '';
  }

  getOrderProgress(createdAt: string | Date, orderDeadline: string | Date): number {
    const start = new Date(createdAt).getTime();
    const end = new Date(orderDeadline).getTime();
    const now = new Date().getTime();

    const total = end - start;
    const elapsed = now - start;

    const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    return Math.round(progress);
  }

  editOrder(commandeId: string): void {
    this.router.navigate(['/edit-order', commandeId]);
  }

  applyFilters(): void {
    let filtered = this.commandes;
 

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(commande => {
        const restaurantName = this.getRestaurantName(commande.restaurantId).toLowerCase();
        return restaurantName.includes(searchLower);
      });

    }

    // Filter by date
    if (this.selectedDate) {
      const selectedDateStr = this.selectedDate;
      filtered = filtered.filter(commande => {
        const commandeDate = new Date(commande.createdAt);
        const commandeDateStr = commandeDate.toISOString().split('T')[0];  
        return commandeDateStr === selectedDateStr;
      });
  
    }

    // Filter by status
    if (this.statusFilter === 'all') {

    } else if (this.statusFilter && this.statusFilter !== 'all') {
      filtered = filtered.filter(commande => commande.status === this.statusFilter);
    
    }

    // Filter by restaurant if selected
    if (this.selectedRestaurantId) {
      filtered = filtered.filter(commande => commande.restaurantId === this.selectedRestaurantId);
  
    }

    this.filteredCommandes = filtered;
  
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDate = null;
    this.statusFilter = 'cree';
    this.selectedRestaurantId = '';
    this.restaurantSearchControl.setValue('');
    this.applyFilters();
  }

  getCommandeOrders(commandeId: string): any[] {
    // This method should return the orders for a specific commande
    // Implementation depends on your data structure
    return [];
  }

  hasJoined(commandeId: string): boolean {
    return this.joinedCommandes.has(commandeId);
  }

  private checkJoinedCommandes(): void {
    this.joinedCommandes.clear();
    this.commandes.forEach(commande => {
      // Check if current user has orders in this commande
      this.orderService.getOrdersByCommandeId(commande.id).subscribe(orders => {
        const userOrder = orders.find(order => order.participantId === this.currentUserId);
        if (userOrder) {
          this.joinedCommandes.add(commande.id);
        }
      });
    });
  }
}