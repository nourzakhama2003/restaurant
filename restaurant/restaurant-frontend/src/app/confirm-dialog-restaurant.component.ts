import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog-restaurant',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title>Confirmation</h2>
    <mat-dialog-content>
      <p>Voulez-vous vraiment supprimer ce restaurant ?</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-button color="warn" (click)="onConfirm()">Supprimer</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogRestaurantComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogRestaurantComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
