import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { Restaurant } from '../../models/restaurant.model';
import { MenuItem } from '../../models/menu-item.model';
import { MenuItemFormComponent } from '../menu-item-form/menu-item-form.component';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';
import { MenuService } from '../../services/menu.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-menu-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.css']
})
export class MenuDialogComponent {
  plats: MenuItem[];
  isLoading = false;
  categories: Category[] = [];
  selectedCategoryId: string = '';

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<MenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public restaurant: Restaurant,
    private menuService: MenuService // injection du service
  ) {
    this.plats = restaurant.menus || [];
    // Load fresh menu items from the backend to ensure we have the latest data
    this.loadMenuItems();
    this.menuService.getAllCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Erreur lors du chargement des catégories:', err)
    });
  }

  private loadMenuItems() {
    this.isLoading = true;
    const restaurantId = this.restaurant.id || '';
    if (restaurantId) {
  
      this.menuService.getMenuItemsByRestaurant(restaurantId).subscribe({
        next: (menuItems) => {
   
          this.plats = menuItems;
          this.isLoading = false;
        },
        error: (err) => {

          // Fallback to restaurant.menu if API call fails
          this.plats = this.restaurant.menus || [];
          this.isLoading = false;
        }
      });
    } else {
      console.error('Restaurant ID is missing, cannot load menu items');
      this.isLoading = false;
    }
  }

  openAddPlatForm() {
    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '600px',
      data: { restaurantId: this.restaurant.id || '' }
    });

    dialogRef.afterClosed().subscribe((savedItem: MenuItem) => {
      if (savedItem) {
        this.isLoading = true;
        this.menuService.getMenuItemsByRestaurant(this.restaurant.id || '').subscribe({
          next: (data) => {
            this.plats = data;
            this.isLoading = false;
          },
          error: (err) => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  openEditPlatForm(index: number) {
    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '700px',
      data: { restaurantId: this.restaurant.id || '', menuItem: this.plats[index] }
    });

    dialogRef.afterClosed().subscribe((savedItem: MenuItem) => {
      if (savedItem) {
        this.isLoading = true;
        this.menuService.getMenuItemsByRestaurant(this.restaurant.id || '').subscribe({
          next: (data) => {
            this.plats = data;
            this.isLoading = false;
          },
          error: (err) => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  deletePlat(index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Voulez-vous vraiment supprimer ce plat ?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const platToDelete = this.plats[index];
        if (platToDelete.id) {
          this.isLoading = true;
          this.menuService.deleteMenuItem(platToDelete.id).subscribe({
            next: () => {
              this.menuService.getMenuItemsByRestaurant(this.restaurant.id || '').subscribe({
                next: (data) => {
                  this.plats = data;
                  this.isLoading = false;
                },
                error: (err) => {
                  this.isLoading = false;
                }
              });
            },
            error: err => {
              this.isLoading = false;
            }
          });
        } else {
          this.plats.splice(index, 1);
        }
      }
    });
  }

  get filteredPlats(): MenuItem[] {
    return this.selectedCategoryId
      ? this.plats.filter(plat => plat.categoryId === this.selectedCategoryId)
      : this.plats;
  }


  cancel() {
    this.dialogRef.close();
  }
}
