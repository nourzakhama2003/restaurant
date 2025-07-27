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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';
import { Category } from '../../models/category.model';
import { MenuService } from '../../services/menu.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-category-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    templateUrl: './category-management.component.html',
    styleUrls: ['./category-management.component.css'],
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class CategoryManagementComponent implements OnInit {
    categories: Category[] = [];
    filteredCategories: Category[] = [];
    form: FormGroup;
    editingCategory: Category | null = null;
    defaultImage = '/assets/images/fastfood.jpeg';
    searchTerm: string = '';
    isLoading: boolean = false;
    isSubmitting: boolean = false;
    showForm: boolean = false;

    constructor(
        private menuService: MenuService, 
        private fb: FormBuilder, 
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: [''],
            imageBase64: ['']
        });
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories() {
        this.isLoading = true;
        this.menuService.getAllCategories().subscribe({
            next: cats => {
                this.categories = cats;
                this.filteredCategories = [...cats];
                this.isLoading = false;
            },
            error: err => {
                console.error('Error loading categories:', err);
                this.snackBar.open('Erreur lors du chargement des catégories', 'Fermer', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    filterCategories() {
        if (!this.searchTerm.trim()) {
            this.filteredCategories = [...this.categories];
        } else {
            const searchLower = this.searchTerm.toLowerCase();
            this.filteredCategories = this.categories.filter(cat =>
                cat.name.toLowerCase().includes(searchLower) ||
                (cat.description && cat.description.toLowerCase().includes(searchLower))
            );
        }
    }

    clearSearch() {
        this.searchTerm = '';
        this.filteredCategories = [...this.categories];
    }

    onImageSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                this.snackBar.open('L\'image doit faire moins de 5MB', 'Fermer', { duration: 3000 });
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.snackBar.open('Veuillez sélectionner une image valide', 'Fermer', { duration: 3000 });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.form.patchValue({ imageBase64: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.form.patchValue({ imageBase64: '' });
    }

    getImageForCategory(cat: Category): string {
        return cat.imageBase64 && cat.imageBase64.trim() !== '' ? cat.imageBase64 : this.defaultImage;
    }

    getImageForForm(): string {
        return this.form.value.imageBase64 && this.form.value.imageBase64.trim() !== '' ? this.form.value.imageBase64 : this.defaultImage;
    }

    submit() {
        if (this.form.invalid) {
            this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
            return;
        }

        this.isSubmitting = true;
        const category: Category = {
            ...this.form.value,
            id: this.editingCategory?.id
        };

        const request = this.editingCategory
            ? this.menuService.updateCategory(this.editingCategory.id!, category)
            : this.menuService.createCategory(category);

        request.subscribe({
            next: () => {
                this.snackBar.open(
                    this.editingCategory ? 'Catégorie mise à jour avec succès' : 'Catégorie créée avec succès', 
                    'Fermer', 
                    { duration: 3000 }
                );
                this.loadCategories();
                this.closeForm();
            },
            error: err => {
                console.error('Error saving category:', err);
                this.snackBar.open(
                    'Erreur lors de l\'enregistrement de la catégorie', 
                    'Fermer', 
                    { duration: 3000 }
                );
                this.isSubmitting = false;
            }
        });
    }

    edit(cat: Category) {
        this.editingCategory = cat;
        this.form.patchValue(cat);
        this.showForm = true;
    }

    delete(cat: Category) {
        if (!cat.id) return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Supprimer la catégorie',
                message: `Êtes-vous sûr de vouloir supprimer la catégorie "${cat.name}" ? Cette action est irréversible.`,
                confirmLabel: 'Supprimer',
                confirmIcon: 'delete'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.menuService.deleteCategory(cat.id!).subscribe({
                    next: () => {
                        this.snackBar.open('Catégorie supprimée avec succès', 'Fermer', { duration: 3000 });
                        this.loadCategories();
                    },
                    error: err => {
                        console.error('Error deleting category:', err);
                        this.snackBar.open('Erreur lors de la suppression de la catégorie', 'Fermer', { duration: 3000 });
                    }
                });
            }
        });
    }

    closeForm() {
        this.showForm = false;
        this.editingCategory = null;
        this.form.reset();
        this.isSubmitting = false;
    }

    cancelEdit() {
        this.closeForm();
    }
} 