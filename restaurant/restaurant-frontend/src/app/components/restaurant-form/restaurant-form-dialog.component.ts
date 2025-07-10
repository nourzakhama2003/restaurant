import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-restaurant-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './restaurant-form-dialog.component.html',
  styleUrls: ['./restaurant-form-dialog.component.css']
})
export class RestaurantFormDialogComponent {

  restaurantForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RestaurantFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!(data && data.name);

    this.restaurantForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      address: [data?.address || ''],
      phone: [data?.phone || ''],
      cuisineType: [data?.cuisineType || ''],
      deleted: [data?.deleted || false]
    });
  }

  onSubmit(): void {
    if (this.restaurantForm.valid) {
      this.dialogRef.close(this.restaurantForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
