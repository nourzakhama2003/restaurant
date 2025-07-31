import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-restaurant-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './restaurant-form-dialog.component.html',
  styleUrls: ['./restaurant-form-dialog.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
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
      name: [data?.name || '', [Validators.required, Validators.minLength(2)]],
      description: [data?.description || ''],
      address: [data?.address || ''],
      phone: [data?.phone || ''],
      cuisineType: [data?.cuisineType || ''],
      deleted: [data?.deleted || false],
      profileImageBase64: [data?.profileImageBase64 || '']
    });
    this.selectedImage = data?.profileImageBase64 || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Veuillez sélectionner une image valide', 'Fermer', { duration: 3000 });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('L\'image doit faire moins de 5MB', 'Fermer', { duration: 3000 });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
        this.restaurantForm.patchValue({ profileImageBase64: this.selectedImage });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.restaurantForm.patchValue({ profileImageBase64: '' });
  }

  onSubmit(): void {
    if (this.restaurantForm.valid) {
      this.isLoading = true;

      // Simulate loading for better UX
      setTimeout(() => {
        this.dialogRef.close(this.restaurantForm.value);
        this.snackBar.open(
          this.isEditMode ? 'Restaurant mis à jour avec succès' : 'Restaurant créé avec succès',
          'Fermer',
          { duration: 3000 }
        );
      }, 1000);
    } else {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

