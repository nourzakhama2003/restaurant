import { Component, Input, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MenuItemFormComponent } from '../menu-item-form/menu-item-form.component';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Category } from '../../models/category.model';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {
  @Input() restaurantId!: string;
  menuItems: MenuItem[] = [];
  restaurant?: Restaurant;
  isLoading = false;
  categories: Category[] = [];
  selectedCategoryId: string = '';

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    if (!this.restaurantId) {
      this.restaurantId = this.route.snapshot.paramMap.get('id') || '';
    }
    if (this.restaurantId) {
      this.isLoading = true;
      this.loadMenu();
      this.restaurantService.getRestaurantById(this.restaurantId).subscribe(data => {
        this.restaurant = data;
      });
      // Fetch categories
      this.menuService.getAllCategories().subscribe({
        next: (cats) => this.categories = cats,
        error: (err) => console.error('Erreur lors du chargement des catégories:', err)
      });
    }
  }

  loadMenu() {
    this.menuService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
      next: (data) => {
        this.menuItems = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  delete(id?: string) {
    if (!id) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this menu item?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.menuService.deleteMenuItem(id).subscribe(() => {
          this.menuItems = this.menuItems.filter(i => i.id !== id);
        });
      }
    });
  }

  addItem() {
    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '400px',
      data: { restaurantId: this.restaurantId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenu();
      }
    });
  }

  editItem(item: MenuItem) {
    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '400px',
      data: { restaurantId: this.restaurantId, menuItem: item }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenu();
      }
    });
  }

  getItemImage(item: MenuItem): string {
    return item.imageBase64 || 'assets/images/plat.png';
  }

  getRestaurantName(restaurantId: string): string {
    if (this.restaurant && this.restaurant.id === restaurantId) {
      return this.restaurant.name;
    }
    return restaurantId;
  }

  get filteredMenuItems(): MenuItem[] {
    if (!this.selectedCategoryId) return this.menuItems;
    return this.menuItems.filter(item => item.categoryId === this.selectedCategoryId);
  }

  getCategoryName(categoryId: string): string {
    const cat = this.categories.find(c => c.id === categoryId);
    return cat ? cat.name : '';
  }

  openAddMenuItemDialog() {
    this.addItem();
  }
}
