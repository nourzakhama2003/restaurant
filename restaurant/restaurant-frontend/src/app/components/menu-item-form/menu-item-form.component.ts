import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Category } from '../../models/category.model';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

interface MenuItemFormData {
  restaurantId: string;
  menuItem?: MenuItem;
}

@Component({
  selector: 'app-menu-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
  ],
  templateUrl: './menu-item-form.component.html',
  styleUrls: ['./menu-item-form.component.css']

})
export class MenuItemFormComponent {
  form: FormGroup;
  restaurantId: string;
  menuItem?: MenuItem;
  imageBase64: string | null = null;
  categories: Category[] = [];
  restaurants: Restaurant[] = [];
  // Remove all restaurant search logic and variables

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    public dialogRef: MatDialogRef<MenuItemFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MenuItemFormData,
    private sanitizer: DomSanitizer
  ) {
    this.restaurantId = data.restaurantId;
    this.menuItem = data.menuItem;
    this.imageBase64 = data.menuItem?.imageBase64 || null;

    this.form = this.fb.group({
      name: [this.menuItem?.name || '', Validators.required],
      description: [this.menuItem?.description || ''],
      price: [this.menuItem?.price ?? ''],
      categoryId: [this.menuItem?.categoryId || '', Validators.required],
      restaurantId: [this.restaurantId],
    });

    // Fetch categories
    this.menuService.getAllCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Erreur lors du chargement des catégories:', err)
    });

    // Fetch all restaurants
    this.restaurantService.getAllRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        // Remove all restaurant search logic and variables
      },
      error: (err) => console.error('Erreur lors du chargement des restaurants:', err)
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onRestaurantSelected(restaurant: Restaurant) {
    this.form.patchValue({ restaurantId: restaurant.id });
    // Optionally, fetch categories for this restaurant only
  }

  displayRestaurantFn = (restaurant: Restaurant) => restaurant && restaurant.name ? restaurant.name : '';

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    let menuItem: MenuItem = {
      id: this.menuItem?.id,
      ...this.form.value,
      imageBase64: this.imageBase64 || undefined,
      categoryId: this.form.value.categoryId || undefined
    };
    if (typeof menuItem.price === 'string' && menuItem.price === '') {
      delete (menuItem as any).price;
    }

    const request = menuItem.id
      ? this.menuService.updateMenuItem(menuItem.id, menuItem)
      : this.menuService.createMenuItem(menuItem);

    request.subscribe({
      next: savedItem => {
        this.dialogRef.close(savedItem);
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde du plat:', err);

      }
    });
  }

}
