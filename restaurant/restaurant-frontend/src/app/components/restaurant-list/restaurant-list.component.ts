import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantFormDialogComponent } from '../restaurant-form/restaurant-form-dialog.component';
import { ConfirmDialogRestaurantComponent } from '../../confirm-dialog-restaurant.component';
import { MenuDialogComponent } from '../menu-dialog/menu-dialog.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { delay } from 'rxjs';
@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule,
    MatProgressSpinnerModule
    // BrowserAnimationsModule removed
  ],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css'],
  animations: [
    // Define the fade-in animation
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100px) scale(0.5)', opacity: 0 }),
        animate('800ms cubic-bezier(.25,.8,.25,1)', style({ transform: 'translateX(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('600ms cubic-bezier(.25,.8,.25,1)', style({ transform: 'translateX(100px) scale(0.5)', opacity: 0 }))
      ])
    ])
  ]
})
export class RestaurantListComponent implements OnInit, AfterViewInit {
  searchText = '';
  isLoading = false;
  restaurants: Restaurant[] = [];
  @ViewChildren('restaurantCard', { read: ElementRef }) cards!: QueryList<ElementRef>;

  constructor(
    private restaurantService: RestaurantService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    // Observe initial cards
    this.cards.forEach(card => observer.observe(card.nativeElement));

    // Re-observe whenever the list changes (e.g., after filtering or loading)
    this.cards.changes.subscribe((cards: QueryList<ElementRef>) => {
      cards.forEach(card => observer.observe(card.nativeElement));
    });
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.restaurantService.getAllRestaurants()
      .pipe(delay(1000))
      .subscribe({
        next: (data: Restaurant[]) => {
          this.restaurants = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError(err);
          this.isLoading = false;
        }
      });
  }

  filteredRestaurants(): Restaurant[] {
    const text = this.searchText.toLowerCase();
    return this.restaurants.filter(
      (r) =>
        (r.name ?? '').toLowerCase().includes(text) ||
        (r.description ?? '').toLowerCase().includes(text)
    );
  }

  openDialog(restaurant?: Restaurant): void {
    const dialogRef = this.dialog.open(RestaurantFormDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      height: 'auto',
      data: restaurant || {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (restaurant && restaurant.id) {
          this.restaurantService.updateRestaurant(restaurant.id, result).subscribe({
            next: (updated) => {
              const index = this.restaurants.findIndex((r) => r.id === restaurant.id);
              if (index !== -1) {
                this.restaurants[index] = updated;
                this.snackBar.open('Restaurant updated successfully!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top'
                });
              }
            },
            error: (err) => this.handleError(err)
          });
        } else {
          this.restaurantService.createRestaurant(result).subscribe({
            next: (newRest) => {
              this.restaurants.push(newRest);
              this.snackBar.open('Restaurant added successfully!', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            },
            error: (err) => this.handleError(err)
          });
        }
      }
    });
  }

  deleteRestaurant(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogRestaurantComponent, {
      width: '600px',
      data: { message: 'Voulez-vous vraiment supprimer ce restaurant ?' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.restaurantService.deleteRestaurant(id).subscribe({
          next: () => {
            this.restaurants = this.restaurants.filter((r) => r.id !== id);
            this.snackBar.open('Restaurant deleted successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          error: (err) => this.handleError(err)
        });
      }
    });
  }

  openMenuDialog(restaurant: Restaurant): void {
    const dialogRef = this.dialog.open(MenuDialogComponent, {
      width: '600px',
      data: restaurant
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadRestaurants();
    });
  }

  private handleError(err: any): void {
    console.error(err);
    this.snackBar.open('An error occurred. Please try again.', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}