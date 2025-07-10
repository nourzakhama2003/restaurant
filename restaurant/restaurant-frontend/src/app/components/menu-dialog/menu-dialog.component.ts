import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Restaurant } from '../../models/restaurant.model';
import { MenuItem } from '../../services/menu.service';
import { MenuItemFormComponent } from '../menu-item-form/menu-item-form.component';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-menu-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    ConfirmDialogComponent
  ],
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.css']
})
export class MenuDialogComponent {
  plats: MenuItem[];

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<MenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public restaurant: Restaurant,
    private menuService: MenuService // injection du service
  ) {
    this.plats = restaurant.menu || [];
  }

  openAddPlatForm() {
    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '600px',
      data: { restaurantId: this.restaurant.id }
    });

    dialogRef.afterClosed().subscribe((savedItem: MenuItem) => {
      if (savedItem) {
        this.plats.push(savedItem);
      }
    });
  }

  openEditPlatForm(index: number) {
    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '600px',
      data: { restaurantId: this.restaurant.id, menuItem: this.plats[index] }
    });

    dialogRef.afterClosed().subscribe((savedItem: MenuItem) => {
      if (savedItem) {
        this.plats[index] = savedItem;
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
        this.menuService.deleteMenuItem(platToDelete.id).subscribe({
          next: () => {
            this.plats.splice(index, 1);
          },
          error: err => {
            console.error('Erreur suppression plat', err);
          }
        });
      } else {
        this.plats.splice(index, 1);
      }
    }
  });
}



  cancel() {
    this.dialogRef.close();
  }
}
