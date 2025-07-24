import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  message: string;
  title?: string;
  confirmLabel?: string;
  confirmIcon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title text-blue-500">{{ data.title || 'Confirmer la suppression' }}</h2>
    <mat-dialog-content class="dialog-content">
      <p class="dialog-message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions class="dialog-actions">
      <button mat-raised-button class="cancel-button" (click)="onCancel()" aria-label="Annuler">
        <mat-icon>cancel</mat-icon> Annuler
      </button>
      <button mat-raised-button class="delete-button" (click)="onConfirm()" [attr.aria-label]="data.confirmLabel || 'Confirmer la suppression'">
        <mat-icon>{{ data.confirmIcon || 'delete' }}</mat-icon> {{ data.confirmLabel || 'Supprimer' }}
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
      background-color: #ef4444 !important;
      color: white !important;
    }
    .cancel-button:hover {
      background-color: #dc2626 !important;
    }
    .delete-button {
      background-color: #22c55e !important;
      color: white !important;
    }
    .delete-button:hover {
      background-color: #16a34a !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}