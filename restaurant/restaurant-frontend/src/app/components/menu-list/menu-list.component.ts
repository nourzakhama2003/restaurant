import { Component, Input, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MenuItemFormComponent } from '../menu-item-form/menu-item-form.component';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { Category } from '../../models/category.model';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
    MatCardModule,
  ],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MenuListComponent implements OnInit {
  @Input() restaurantId!: string;
  menuItems: MenuItem[] = [];
  restaurant?: Restaurant;
  isLoading = false;
  categories: Category[] = [];
  selectedCategoryId: string = '';
  searchText: string = '';

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private restaurantService: RestaurantService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (!this.restaurantId) {
      this.restaurantId = this.route.snapshot.paramMap.get('id') || '';
    }
    if (this.restaurantId) {
      this.isLoading = true;
      this.loadMenu();
      this.loadRestaurant();
      this.loadCategories();
    }
  }

  loadMenu() {
    this.menuService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
      next: (data) => {
        this.menuItems = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du menu:', err);
        this.snackBar.open('Erreur lors du chargement du menu', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadRestaurant() {
    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (data) => {
        this.restaurant = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du restaurant:', err);
        this.snackBar.open('Erreur lors du chargement du restaurant', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadCategories() {
    this.menuService.getAllCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
        this.snackBar.open('Erreur lors du chargement des catégories', 'Fermer', { duration: 3000 });
      }
    });
  }

  getRestaurantImage(restaurant: Restaurant): string {
    if (restaurant.profileImageBase64) {
      return restaurant.profileImageBase64;
    }
    return '/assets/images/restaurant.jpeg';
  }

  clearSearch(): void {
    this.searchText = '';
  }

  delete(id?: string) {
    if (!id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce plat ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.menuService.deleteMenuItem(id).subscribe({
          next: () => {
            this.menuItems = this.menuItems.filter(i => i.id !== id);
            this.snackBar.open('Plat supprimé avec succès', 'Fermer', { duration: 3000 });
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
            this.snackBar.open('Erreur lors de la suppression du plat', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  addItem() {
    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { restaurantId: this.restaurantId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenu();
        this.snackBar.open('Plat ajouté avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  editItem(item: MenuItem) {
    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: {
        restaurantId: this.restaurantId,
        menuItem: item
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenu();
        this.snackBar.open('Plat mis à jour avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  getItemImage(item: MenuItem): string {
    if (item.imageBase64) {
      return item.imageBase64;
    }
    return '/assets/images/plat.png';
  }

  getRestaurantName(restaurantId: string): string {
    return this.restaurant?.name || 'Restaurant';
  }

  get filteredMenuItems(): MenuItem[] {
    let filtered = this.menuItems;

    // Filter by search text
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (this.selectedCategoryId) {
      filtered = filtered.filter(item => item.categoryId === this.selectedCategoryId);
    }

    return filtered;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  }

  openAddMenuItemDialog() {
    this.addItem();
  }
}
