import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';
import { Category } from '../../models/category.model';
import { MenuService } from '../../services/menu.service';

@Component({
    selector: 'app-category-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDialogModule
    ],
    templateUrl: './category-management.component.html',
    styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
    categories: Category[] = [];
    form: FormGroup;
    editingCategory: Category | null = null;
    defaultImage = '/assets/images/fastfood.jpeg';

    constructor(private menuService: MenuService, private fb: FormBuilder, private dialog: MatDialog) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            imageBase64: ['']
        });
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories() {
        this.menuService.getAllCategories().subscribe({
            next: cats => this.categories = cats,
            error: err => console.error('Error loading categories:', err)
        });
    }

    onImageSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.form.patchValue({ imageBase64: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    }

    getImageForCategory(cat: Category): string {
        return cat.imageBase64 && cat.imageBase64.trim() !== '' ? cat.imageBase64 : this.defaultImage;
    }

    getImageForForm(): string {
        return this.form.value.imageBase64 && this.form.value.imageBase64.trim() !== '' ? this.form.value.imageBase64 : this.defaultImage;
    }

    submit() {
        if (this.form.invalid) return;
        const category: Category = {
            ...this.form.value,
            id: this.editingCategory?.id
        };
        const request = this.editingCategory
            ? this.menuService.updateCategory(this.editingCategory.id!, category)
            : this.menuService.createCategory(category);
        request.subscribe({
            next: () => {
                this.loadCategories();
                this.form.reset();
                this.editingCategory = null;
            },
            error: err => console.error('Error saving category:', err)
        });
    }

    edit(cat: Category) {
        this.editingCategory = cat;
        this.form.patchValue(cat);
    }

    delete(cat: Category) {
        if (!cat.id) return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: { message: 'Are you sure you want to delete this category?' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.menuService.deleteCategory(cat.id!).subscribe({
                    next: () => this.loadCategories(),
                    error: err => console.error('Error deleting category:', err)
                });
            }
        });
    }

    cancelEdit() {
        this.editingCategory = null;
        this.form.reset();
    }
} 