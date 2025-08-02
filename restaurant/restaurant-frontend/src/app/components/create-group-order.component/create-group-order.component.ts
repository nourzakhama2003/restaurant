import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { CommandeService, Commande } from '../../services/commande.service';
import { UserService } from '../../services/user.service';
import { Restaurant } from '../../models/restaurant.model';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

// Add pad function at the top of the file
function pad(n: number) { return n.toString().padStart(2, '0'); }

@Component({
  selector: 'app-create-group-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // <-- Add this for ngModel
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressBarModule // <-- Add this for mat-progress-bar
  ],
  templateUrl: "./create-group-order.component.html",
  styleUrls: ["./create-group-order.component.css"]
})
export class CreateGroupOrderComponent implements OnInit {
  groupOrderForm: FormGroup;
  restaurants: Restaurant[] = [];
  filteredRestaurants: Observable<Restaurant[]> = new Observable();
  isLoading = false;
  deadlineValidationMessage = '';
  isDeadlineValid = true;

  // --- ENHANCED RESTAURANT SEARCH LOGIC ---
  // Remove searchText and filteredRestaurantNames
  // Restore filteredRestaurants Observable and setupRestaurantFilter logic

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private commandeService: CommandeService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.groupOrderForm = this.fb.group({
      restaurantId: [''], // Hidden field, set when restaurant is selected
      restaurantSearch: ['', Validators.required], // Search input field
      creatorId: [''], // Hidden field
      creatorName: [''], // Display only, readonly
      orderDeadlineDate: ['', Validators.required],
      orderDeadlineTime: ['', Validators.required],
      deliveryFee: [0, [Validators.required, Validators.min(0)]] // Add delivery fee field
    });
  }

  ngOnInit(): void {
    this.loadRestaurants();
    this.loadCurrentUser();
    this.setDefaultDateAndTime();
    this.validateAndUpdateStatus();
  }

  private setDefaultDateAndTime(): void {
    const now = new Date();
    // Set default deadline to now + 10 minutes (local time)
    const defaultDeadline = new Date(now.getTime() + 10 * 60 * 1000);
    // Set the form controls to the correct local date and time
    this.groupOrderForm.patchValue({
      orderDeadlineDate: defaultDeadline,
      orderDeadlineTime: defaultDeadline.toTimeString().substring(0, 5) // 'HH:mm' local time
    });

    // Add real-time validation listeners
    this.groupOrderForm.get('orderDeadlineDate')?.valueChanges.subscribe(() => {
      this.validateAndUpdateStatus();
    });

    this.groupOrderForm.get('orderDeadlineTime')?.valueChanges.subscribe(() => {
      this.validateAndUpdateStatus();
    });
  }

  private validateAndUpdateStatus(): void {
    const validation = this.validateDeadline();

    this.isDeadlineValid = validation.isValid;
    this.deadlineValidationMessage = validation.errorMessage || '';

    if (!validation.isValid && validation.errorMessage) {
      // Show validation error in console for now
      console.warn('Deadline validation:', validation.errorMessage);
    }
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUserInfo().subscribe({
      next: (userInfo) => {
        if (userInfo) {
          this.groupOrderForm.patchValue({
            creatorId: userInfo.id,
            creatorName: userInfo.name
          });
        } else {
          this.snackBar.open('Unable to load user information', 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        console.error('Error loading user information:', error);
        this.snackBar.open('Error loading user information', 'Close', { duration: 3000 });
      }
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
        this.snackBar.open('Error loading restaurants', 'Close', { duration: 3000 });
      }
    });
  }

  private setupRestaurantFilter(): void {
    this.filteredRestaurants = this.groupOrderForm.get('restaurantSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRestaurants(value || ''))
    );

    // Clear restaurantId when search field is cleared
    this.groupOrderForm.get('restaurantSearch')!.valueChanges.subscribe(value => {
      if (!value) {
        this.groupOrderForm.patchValue({ restaurantId: '' });
      }
    });
  }

  private _filterRestaurants(value: string): Restaurant[] {
    const filterValue = value.toLowerCase();
    return this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(filterValue) ||
      (restaurant.cuisineType && restaurant.cuisineType.toLowerCase().includes(filterValue))
    );
  }

  onRestaurantSelected(restaurant: Restaurant): void {
    this.groupOrderForm.patchValue({
      restaurantId: restaurant.id,
      restaurantSearch: restaurant // set the full object, not just the name
    });
  }

  // Custom validator to check if a restaurant is actually selected
  isRestaurantSelected(): boolean {
    const restaurantId = this.groupOrderForm.get('restaurantId')?.value;
    const restaurantSearch = this.groupOrderForm.get('restaurantSearch')?.value;

    // If restaurantSearch is an object, check its id
    if (restaurantSearch && typeof restaurantSearch === 'object' && restaurantSearch.id) {
      return restaurantSearch.id === restaurantId;
    }
    return false;
  }

  displayRestaurantFn = (restaurant: Restaurant | string): string => {
    if (!restaurant) return '';
    if (typeof restaurant === 'string') return restaurant;
    if (!restaurant.name && restaurant.cuisineType) return restaurant.cuisineType;
    if (!restaurant.name && !restaurant.cuisineType) return '';
    return `${restaurant.name}${restaurant.cuisineType ? ' - ' + restaurant.cuisineType : ''}`;
  }

  private validateDeadline(): { isValid: boolean; errorMessage?: string } {
    const dateValue = this.groupOrderForm.value.orderDeadlineDate;
    const timeValue = this.groupOrderForm.value.orderDeadlineTime;

    // Only show error if user actively clears a field (not on initial load)
    const dateTouched = this.groupOrderForm.get('orderDeadlineDate')?.touched;
    const timeTouched = this.groupOrderForm.get('orderDeadlineTime')?.touched;
    if ((!dateValue || !timeValue) && (dateTouched || timeTouched)) {
      return { isValid: false, errorMessage: 'Please select both date and time' };
    }
    if (!dateValue || !timeValue) {
      // Defaults are present, don't show error, allow submit
      return { isValid: true };
    }

    // If user did not touch the time, allow default (now + 10 min)
    const timeControl = this.groupOrderForm.get('orderDeadlineTime');
    const timeWasChanged = timeControl?.dirty;

    // Create deadline with proper timezone handling
    const orderDeadline = new Date(dateValue);
    const [hours, minutes] = timeValue.split(':');
    orderDeadline.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const bufferTime = 2 * 60 * 1000; // 2 minutes buffer for client-server time differences
    const nowWithBuffer = new Date(now.getTime() - bufferTime);
    const timeDiffMinutes = Math.floor((orderDeadline.getTime() - now.getTime()) / (60 * 1000));

    // If user changed the time, enforce minimum 10 minutes from now
    if (timeWasChanged && timeDiffMinutes < 10) {
      return {
        isValid: false,
        errorMessage: `Deadline must be at least 10 minutes from now if you change the time.`
      };
    }

    // Check if deadline is significantly in the past (more than 2 minutes buffer)
    if (!timeWasChanged && orderDeadline < nowWithBuffer) {
      return {
        isValid: false,
        errorMessage: `Deadline is ${Math.abs(timeDiffMinutes)} minutes in the past. Please select a future time.`
      };
    }

    // Check if deadline is too close (less than 5 minutes) - but allow current time with buffer
    if (!timeWasChanged && timeDiffMinutes < 5 && orderDeadline > now) {
      return {
        isValid: false,
        errorMessage: `Deadline is only ${timeDiffMinutes} minutes away. Please allow at least 5 minutes for participants to join.`
      };
    }

    // Check if deadline is too far in the future (more than 7 days)
    if (timeDiffMinutes > 7 * 24 * 60) {
      const days = Math.floor(timeDiffMinutes / (24 * 60));
      return {
        isValid: false,
        errorMessage: `Deadline is ${days} days in the future. Please select a deadline within 7 days.`
      };
    }

    // All validations passed
    return { isValid: true };
  }

  onSubmit(): void {
    if (this.groupOrderForm.valid) {
      // Combine date and time from the form as local time
      const date: Date = this.groupOrderForm.value.orderDeadlineDate;
      const time: string = this.groupOrderForm.value.orderDeadlineTime; // 'HH:mm'
      const [hours, minutes] = time.split(':').map(Number);
      const deadline = new Date(date);
      deadline.setHours(hours, minutes, 0, 0);

      // Validation: compare local deadline to local now
      const now = new Date();
      if (deadline.getTime() < now.getTime()) {
        this.snackBar.open('Deadline is in the past. Please select a future time.', 'Close', { duration: 3000 });
        return;
      }

      // Format as 'YYYY-MM-DDTHH:mm:00' (local time, no 'Z')
      const orderDeadlineLocal = `${deadline.getFullYear()}-${pad(deadline.getMonth() + 1)}-${pad(deadline.getDate())}T${pad(deadline.getHours())}:${pad(deadline.getMinutes())}:00`;

      this.groupOrderForm.patchValue({ orderDeadline: orderDeadlineLocal });

      this.isLoading = true;


      // Add 1 hour for Tunisia timezone compatibility
      deadline.setHours(deadline.getHours() + 1);

      // Get delivery fee from form
      const deliveryFee = Number(this.groupOrderForm.value.deliveryFee) || 0;


      // Always set deadline at least 2 minutes in the future
      if (deadline.getTime() < now.getTime() + 2 * 60 * 1000) {
        // If user selected a past or too-close time, auto-correct to now + 10 min
        const correctedDeadline = new Date(now.getTime() + 10 * 60 * 1000);
        deadline.setFullYear(correctedDeadline.getFullYear(), correctedDeadline.getMonth(), correctedDeadline.getDate());
        deadline.setHours(correctedDeadline.getHours(), correctedDeadline.getMinutes(), 0, 0);
        // Add 1 hour for Tunisia timezone compatibility
        deadline.setHours(deadline.getHours() + 1);
        this.snackBar.open('Deadline was too close or in the past. Auto-corrected to 10 minutes from now.', 'Close', { duration: 4000 });
      }

      // Format deadline as local ISO string (yyyy-MM-ddTHH:mm)
      const orderDeadlineIso = `${deadline.getFullYear()}-${pad(deadline.getMonth() + 1)}-${pad(deadline.getDate())}T${pad(deadline.getHours())}:${pad(deadline.getMinutes())}`;

      // Add 1 hour for Tunisia timezone compatibility to createdAt and updatedAt
      const nowTunisia = new Date(now.getTime());
      nowTunisia.setHours(nowTunisia.getHours() + 1);
      const nowIso = `${nowTunisia.getFullYear()}-${pad(nowTunisia.getMonth() + 1)}-${pad(nowTunisia.getDate())}T${pad(nowTunisia.getHours())}:${pad(nowTunisia.getMinutes())}`;


      const commande: any = {
        restaurantId: this.groupOrderForm.value.restaurantId,
        creatorId: this.groupOrderForm.value.creatorId,
        creatorName: this.groupOrderForm.value.creatorName,
        orderDeadline: orderDeadlineIso,
        totalPrice: 0,
        deliveryFee: deliveryFee, // Add delivery fee to commande
        createdAt: nowIso,
        updatedAt: nowIso,
        orders: [],
        deleted: false
      };


      this.commandeService.createCommande(commande).subscribe({
        next: (commande: Commande) => {
          this.isLoading = false;
          this.snackBar.open('Group order created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/group-orders/details', commande.id]);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error creating group order:', error);
          this.snackBar.open('Error creating group order', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Show validation errors
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }
  getCurrentStatus(): string {
    const validation = this.validateDeadline();

    // If deadline is valid, show that it will be created
    if (validation.isValid) {
      return 'Valid - Will be created';
    }

    // If deadline is invalid, show the specific issue
    const dateValue = this.groupOrderForm.value.orderDeadlineDate;
    const timeValue = this.groupOrderForm.value.orderDeadlineTime;

    if (dateValue && timeValue) {
      const orderDeadline = new Date(dateValue);
      const [hours, minutes] = timeValue.split(':');
      orderDeadline.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      // Add 1 hour for Tunisia timezone compatibility
      orderDeadline.setHours(orderDeadline.getHours() + 1);

      const now = new Date();
      // Add 1 hour to now for consistency with deadline
      const nowTunisia = new Date(now.getTime());
      nowTunisia.setHours(nowTunisia.getHours() + 1);
      const timeDiffMinutes = Math.floor((orderDeadline.getTime() - nowTunisia.getTime()) / (60 * 1000));

      if (timeDiffMinutes < 0) {
        return `Invalid - ${Math.abs(timeDiffMinutes)} min ago`;
      } else if (timeDiffMinutes < 5) {
        return `Warning - Only ${timeDiffMinutes} min ahead`;
      }
    }

    return 'Invalid deadline';
  }

  getStatusColor(): string {
    const status = this.getCurrentStatus();
    switch (status) {
      case 'created':
        return 'primary';
      case 'closed':
        return 'warn';
      default:
        return 'accent';
    }
  }

  // Check if the current deadline is in the past
  isDeadlineInPast(): boolean {
    const dateValue = this.groupOrderForm.value.orderDeadlineDate;
    const timeValue = this.groupOrderForm.value.orderDeadlineTime;

    if (!dateValue || !timeValue) {
      return false;
    }

    const orderDeadline = new Date(dateValue);
    const [hours, minutes] = timeValue.split(':');
    orderDeadline.setHours(parseInt(hours), parseInt(minutes));

    const now = new Date();
    return orderDeadline <= now;
  }

  // Get deadline warning message
  getDeadlineWarningMessage(): string {
    if (this.isDeadlineInPast()) {
      return 'Warning: The selected deadline is in the past. The order will be closed immediately.';
    }
    return '';
  }

  // Format deadline for display
  getFormattedDeadline(): string {
    const dateValue = this.groupOrderForm.value.orderDeadlineDate;
    const timeValue = this.groupOrderForm.value.orderDeadlineTime;

    if (!dateValue || !timeValue) {
      return '';
    }

    const orderDeadline = new Date(dateValue);
    const [hours, minutes] = timeValue.split(':');
    orderDeadline.setHours(parseInt(hours), parseInt(minutes));

    return orderDeadline.toLocaleString();
  }

  onCancel(): void {
    this.router.navigate(['/group-orders']);
  }
}
