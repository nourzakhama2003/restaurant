import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuDialogComponent } from '../menu-dialog/menu-dialog.component';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantFormDialogComponent } from '../restaurant-form/restaurant-form-dialog.component';
import { ConfirmDialogRestaurantComponent } from '../../confirm-dialog-restaurant.component';
@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    RestaurantFormDialogComponent,
    MenuDialogComponent,
    ConfirmDialogRestaurantComponent
  ],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent implements OnInit {
  searchText = '';
  restaurants: Restaurant[] = [];
  columns: string[] = ['index', 'name', 'address', 'phone', 'cuisineType', 'menu', 'actions'];
  displayedColumns: string[] = ['name', 'address', 'menu', 'actions'];

  constructor(
    private restaurantService: RestaurantService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.restaurantService.getAllRestaurants().subscribe({
      next: (data) => this.restaurants = data,
      error: (err) => this.handleError(err)
    });
  }

  filteredRestaurants(): Restaurant[] {
    const text = this.searchText.toLowerCase();
    return this.restaurants.filter(r =>
      (r.name ?? '').toLowerCase().includes(text) ||
      (r.description ?? '').toLowerCase().includes(text)
    );
  }

  openDialog(restaurant?: Restaurant): void {
    const dialogRef = this.dialog.open(RestaurantFormDialogComponent, {
      width: '500px',
      data: restaurant || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (restaurant && restaurant.id) {
          this.restaurantService.updateRestaurant(restaurant.id, result).subscribe({
            next: updated => {
              const index = this.restaurants.findIndex(r => r.id === restaurant.id);
              if (index !== -1) this.restaurants[index] = updated;
            },
            error: (err) => this.handleError(err)
          });
        } else {
          this.restaurantService.createRestaurant(result).subscribe({
            next: newRest => this.restaurants.push(newRest),
            error: (err) => this.handleError(err)
          });
        }
      }
    });
  }

 deleteRestaurant(id: string): void {
   const dialogRef = this.dialog.open(ConfirmDialogRestaurantComponent, {
     width: '300px',
     data: { message: 'Voulez-vous vraiment supprimer ce restaurant ?' }
   });

   dialogRef.afterClosed().subscribe(result => {
     if (result === true) {
       this.restaurantService.deleteRestaurant(id).subscribe({
         next: () => {
           this.restaurants = this.restaurants.filter(r => r.id !== id);
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

    dialogRef.afterClosed().subscribe(updatedRestaurant => {
      if (updatedRestaurant) {
        const index = this.restaurants.findIndex(r => r.id === updatedRestaurant.id);
        if (index !== -1) {
          this.restaurants[index] = updatedRestaurant;
        }
      }
    });
  }

  private handleError(err: any): void {
    console.error(err);
  }
}
