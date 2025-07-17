import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog-restaurant',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title text-blue-500">Confirm Deletion</h2>
    <mat-dialog-content class="dialog-content">
      <p class="dialog-message">
        Are you sure you want to permanently delete this restaurant? This action cannot be undone.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions class="dialog-actions">
      <button mat-raised-button class="cancel-button" (click)="onCancel()" aria-label="Cancel deletion">
        <mat-icon>cancel</mat-icon> Cancel
      </button>
      <button mat-raised-button class="delete-button" (click)="onConfirm()" aria-label="Confirm deletion">
        <mat-icon>delete</mat-icon> Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
    }
    .dialog-title {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      padding: 1rem 1.5rem;
    }
    .dialog-content {
      padding: 1.5rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #555;
      overflow: hidden;
    }
    .dialog-message {
      margin: 0;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 1.5rem;
    }
    button[mat-raised-button] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.2s ease-in-out;
    }
    button[mat-raised-button]:hover {
      transform: translateY(-2px);
    }
    mat-icon {
      font-size: 1.2rem;
      vertical-align: middle;
    }
    .cancel-button {
      background-color: #22c55e !important;
      color: white !important;
    }
    .cancel-button:hover {
      background-color: #16a34a !important;
    }
    .delete-button {
      background-color: #ef4444 !important;
      color: white !important;
    }
    .delete-button:hover {
      background-color: #dc2626 !important;
    }
  `]
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