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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantFormDialogComponent } from '../restaurant-form/restaurant-form-dialog.component';
import { ConfirmDialogRestaurantComponent } from '../../confirm-dialog-restaurant.component';
import { MenuDialogComponent } from '../menu-dialog/menu-dialog.component';
import { RouterModule } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component as DialogComponent } from '@angular/core';
import { SafeUrlPipe } from '../../pipe/filter.pipe';

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
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
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
      .subscribe({
        next: (data) => {
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
        (r.description ?? '').toLowerCase().includes(text) ||
        (r.cuisineType ?? '').toLowerCase().includes(text) ||
        (r.address ?? '').toLowerCase().includes(text)
    );
  }

  clearSearch(): void {
    this.searchText = '';
  }

  getRestaurantImage(restaurant: Restaurant): string {
    if (restaurant.profileImageBase64) {
      return restaurant.profileImageBase64;
    }
    // Fallback to default restaurant image
    return '/assets/images/restaurant.jpeg';
  }

  openDialog(restaurant?: Restaurant): void {
    const dialogRef = this.dialog.open(RestaurantFormDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: restaurant || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (restaurant) {
          // Update existing restaurant
          this.restaurantService.updateRestaurant(restaurant.id!, result)
            .subscribe({
              next: (updatedRestaurant) => {
                const index = this.restaurants.findIndex(r => r.id === restaurant.id);
                if (index !== -1) {
                  this.restaurants[index] = updatedRestaurant;
                }
                this.snackBar.open('Restaurant mis à jour avec succès', 'Fermer', { duration: 3000 });
              },
              error: (err) => this.handleError(err)
            });
        } else {
          // Create new restaurant
          this.restaurantService.createRestaurant(result)
            .subscribe({
              next: (newRestaurant) => {
                this.restaurants.push(newRestaurant);
                this.snackBar.open('Restaurant créé avec succès', 'Fermer', { duration: 3000 });
              },
              error: (err) => this.handleError(err)
            });
        }
      }
    });
  }

  deleteRestaurant(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogRestaurantComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.restaurantService.deleteRestaurant(id)
          .subscribe({
            next: () => {
              this.restaurants = this.restaurants.filter(r => r.id !== id);
              this.snackBar.open('Restaurant supprimé avec succès', 'Fermer', { duration: 3000 });
            },
            error: (err) => this.handleError(err)
          });
      }
    });
  }

  openMenuDialog(restaurant: Restaurant): void {
    const dialogRef = this.dialog.open(MenuDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { restaurantId: restaurant.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle menu dialog result if needed
      }
    });
  }

  openMapPopup(restaurant: Restaurant): void {
    this.dialog.open(MapPopupDialog, {
      data: {
        name: restaurant.name,
        address: restaurant.address
      },
      width: '1000px',
      maxWidth: '100vw'
    });
  }

  private handleError(err: any): void {
    console.error('Error:', err);
    this.snackBar.open('Une erreur est survenue', 'Fermer', { duration: 3000 });
  }
}

@DialogComponent({
  selector: 'map-popup-dialog',
  standalone: true,
  imports: [SafeUrlPipe, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Emplacement du restaurant</h2>
    <mat-dialog-content style="padding:0;">
      <iframe
        width="100%"
        height="700"
        frameborder="0"
        style="border:0"
        [src]="googleMapsUrl | safeUrl"
        allowfullscreen>
      </iframe>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
      <a [href]="externalGoogleMapsUrl" target="_blank" rel="noopener" mat-button>Ouvrir dans Google Maps</a>
    </mat-dialog-actions>
  `
})
export class MapPopupDialog {
  googleMapsUrl: string;
  externalGoogleMapsUrl: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string, address: string }) {
    const query = encodeURIComponent(`${data.name} ${data.address || ''}`);
    this.googleMapsUrl = `https://www.google.com/maps?q=${query}&output=embed`;
    this.externalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
}