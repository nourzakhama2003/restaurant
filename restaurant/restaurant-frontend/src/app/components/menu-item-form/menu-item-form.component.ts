import { Component, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Category } from '../../models/category.model';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { MatSnackBar } from '@angular/material/snack-bar';

interface MenuItemFormData {
  restaurantId?: string;
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
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './menu-item-form.component.html',
  styleUrls: ['./menu-item-form.component.css']
})
export class MenuItemFormComponent {
  form: FormGroup;
  restaurantId?: string;
  menuItem?: MenuItem;
  imageBase64: string | null = null;
  categories: Category[] = [];
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  showRestaurantDropdown: boolean = false;
  selectedRestaurant: Restaurant | null = null;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    public dialogRef: MatDialogRef<MenuItemFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MenuItemFormData,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {
    this.restaurantId = data.restaurantId;
    this.menuItem = data.menuItem;
    this.imageBase64 = data.menuItem?.imageBase64 || null;

    this.form = this.fb.group({
      name: [this.menuItem?.name || '', [Validators.required, Validators.minLength(2)]],
      description: [this.menuItem?.description || ''],
      price: [this.menuItem?.price || '', [Validators.required, Validators.min(0)]],
      categoryId: [this.menuItem?.categoryId || '', Validators.required],
      restaurantId: [this.restaurantId || '', this.restaurantId ? [] : Validators.required],
      restaurantSearch: ['']
    });

    // Fetch categories
    this.menuService.getAllCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
        this.snackBar.open('Erreur lors du chargement des catégories', 'Fermer', { duration: 3000 });
      }
    });

    // Fetch all restaurants if no restaurantId is provided
    if (!this.restaurantId) {
      this.restaurantService.getAllRestaurants().subscribe({
        next: (restaurants) => {
          this.restaurants = restaurants;
          this.filteredRestaurants = restaurants;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des restaurants:', err);
          this.snackBar.open('Erreur lors du chargement des restaurants', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.restaurant-search-container')) {
      this.showRestaurantDropdown = false;
    }
  }

  get restaurantSearch(): string {
    return this.form.get('restaurantSearch')?.value || '';
  }

  filterRestaurants(): void {
    const searchTerm = this.restaurantSearch.toLowerCase().trim();

    if (!searchTerm) {
      this.filteredRestaurants = this.restaurants;
      this.showRestaurantDropdown = false;
      return;
    }

    this.filteredRestaurants = this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchTerm)
    );

    this.showRestaurantDropdown = this.filteredRestaurants.length > 0;
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
    this.form.patchValue({
      restaurantId: restaurant.id,
      restaurantSearch: restaurant.name
    });
    this.showRestaurantDropdown = false;
  }

  isRestaurantSelected(): boolean {
    return this.selectedRestaurant !== null;
  }

  getRestaurantImage(restaurant: Restaurant): string {
    if (restaurant.profileImageBase64) {
      return restaurant.profileImageBase64;
    }
    // Fallback to default restaurant image
    return '/assets/images/restaurant.jpeg';
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('L\'image doit faire moins de 5MB', 'Fermer', { duration: 3000 });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Veuillez sélectionner une image valide', 'Fermer', { duration: 3000 });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imageBase64 = null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
      return;
    }

    // Check if restaurant is selected when required
    if (!this.restaurantId && !this.isRestaurantSelected()) {
      this.snackBar.open('Veuillez sélectionner un restaurant', 'Fermer', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    let menuItem: MenuItem = {
      id: this.menuItem?.id,
      ...this.form.value,
      imageBase64: this.imageBase64 || undefined,
      categoryId: this.form.value.categoryId || undefined
    };

    // Ensure price is a number
    if (typeof menuItem.price === 'string') {
      menuItem.price = parseFloat(menuItem.price);
    }

    const request = menuItem.id
      ? this.menuService.updateMenuItem(menuItem.id, menuItem)
      : this.menuService.createMenuItem(menuItem);

    request.subscribe({
      next: savedItem => {
        this.snackBar.open(
          menuItem.id ? 'Plat mis à jour avec succès' : 'Plat créé avec succès',
          'Fermer',
          { duration: 3000 }
        );
        this.dialogRef.close(savedItem);
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde du plat:', err);
        this.snackBar.open(
          'Erreur lors de l\'enregistrement du plat',
          'Fermer',
          { duration: 3000 }
        );
        this.isSubmitting = false;
      }
    });
  }
}
