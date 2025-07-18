import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
interface MenuItemFormData {
  restaurantId: string;
  menuItem?: MenuItem;
}

@Component({
  selector: 'app-menu-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './menu-item-form.component.html',
  styleUrls: ['./menu-item-form.component.css']

})
export class MenuItemFormComponent {
  form: FormGroup;
  restaurantId: string;
  menuItem?: MenuItem;
  imageBase64: string | null = null;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    public dialogRef: MatDialogRef<MenuItemFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MenuItemFormData,
    private sanitizer: DomSanitizer
  ) {
    this.restaurantId = data.restaurantId;
    this.menuItem = data.menuItem;
    this.imageBase64 = data.menuItem?.imageBase64 || null;

    this.form = this.fb.group({
      name: [this.menuItem?.name || '', Validators.required],
      description: [this.menuItem?.description || ''],
      price: [this.menuItem?.price ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const menuItem: MenuItem = {
      id: this.menuItem?.id,
      restaurantId: this.restaurantId,
      ...this.form.value,
      imageBase64: this.imageBase64
    };

    const request = menuItem.id
      ? this.menuService.updateMenuItem(menuItem.id, menuItem)
      : this.menuService.createMenuItem(menuItem);

    request.subscribe({
      next: savedItem => {
        this.dialogRef.close(savedItem);
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde du plat:', err);

      }
    });
  }

}
