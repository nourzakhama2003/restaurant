import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog-restaurant',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
templateUrl: './confirm-dialog-restaurant.component.html',
  styleUrls: ['./confirm-dialog-restaurant.component.css'],
})
export class ConfirmDialogRestaurantComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogRestaurantComponent>) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}