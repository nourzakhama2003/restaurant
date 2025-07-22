import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-restaurant-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './restaurant-form-dialog.component.html',
  styleUrls: ['./restaurant-form-dialog.component.css']
})
export class RestaurantFormDialogComponent {
  selectedImage: string | null = null;
  restaurantForm: FormGroup;
  isEditMode: boolean;
  isLoading = false;

  constructor(
    private snackBar: MatSnackBar,
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
      deleted: [data?.deleted || false],
      profileImageBase64: [data?.profileImageBase64 || '']
    });
    this.selectedImage = data.profileImageBase64 || null;
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Validate file type (optional)
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please upload a valid image file.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size must be less than 5MB.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string; // Base64 string for preview
        this.restaurantForm.patchValue({ profileImageBase64: this.selectedImage });
      };
      reader.readAsDataURL(file); // Convert image to Base64
    }
  }
  onSubmit(): void {
    if (this.restaurantForm.valid) {
      this.dialogRef.close(this.restaurantForm.value);
    } else {
      this.snackBar.open('Please fill out the form correctly.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
