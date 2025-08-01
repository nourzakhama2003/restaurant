import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { MenuItemFormComponent } from '../menu-item-form/menu-item-form.component';
import { ConfirmDialogComponent } from '../../generalconfirmation/confirm-dialog.component';
import { Category } from '../../models/category.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-all-menu-items',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSnackBarModule
    ],
    templateUrl: './all-menu-items.component.html',
    styleUrls: ['./all-menu-items.component.css'],
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class AllMenuItemsComponent implements OnInit, AfterViewInit {
    menuItems: MenuItem[] = [];
    restaurants: Restaurant[] = [];
    searchText: string = '';
    isLoading = false;
    categories: Category[] = [];
    selectedCategoryId: string = '';
    @ViewChildren('menuCard', { read: ElementRef }) cards!: QueryList<ElementRef>;

    constructor(
        private menuService: MenuService,
        private restaurantService: RestaurantService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.loadAllItems();
        this.restaurantService.getAllRestaurants().subscribe(data => {
            this.restaurants = data;
        });
        this.menuService.getAllCategories().subscribe({
            next: (cats) => this.categories = cats,
            error: (err) => {
                console.error('Erreur lors du chargement des catégories:', err);
                this.snackBar.open('Erreur lors du chargement des catégories', 'Fermer', { duration: 3000 });
            }
        });
    }

    ngAfterViewInit() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    } else {
                        entry.target.classList.remove('visible');
                    }
                });
            },
            { threshold: 0.2 }
        );

        this.cards.forEach(card => observer.observe(card.nativeElement));

        this.cards.changes.subscribe((cards: QueryList<ElementRef>) => {
            cards.forEach(card => observer.observe(card.nativeElement));
        });
    }

    loadAllItems() {
        this.menuService.getAllMenuItems().subscribe({
            next: (data) => {
                this.menuItems = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur lors du chargement des plats:', err);
                this.snackBar.open('Erreur lors du chargement des plats', 'Fermer', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    getRestaurantName(restaurantId: string): string {
        const rest = this.restaurants.find(r => r.id === restaurantId);
        return rest ? rest.name : restaurantId;
    }

    getCategoryName(categoryId?: string): string {
        if (!categoryId) return '';
        const cat = this.categories.find(c => c.id === categoryId);
        return cat ? cat.name : '';
    }

    clearSearch() {
        this.searchText = '';
    }

    delete(id?: string) {
        if (!id) return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Supprimer le plat',
                message: 'Êtes-vous sûr de vouloir supprimer ce plat ? Cette action est irréversible.',
                confirmLabel: 'Supprimer',
                confirmIcon: 'delete'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.isLoading = true;
                this.menuService.deleteMenuItem(id).subscribe({
                    next: () => {
                        this.menuItems = this.menuItems.filter(i => i.id !== id);
                        this.isLoading = false;
                        this.snackBar.open('Plat supprimé avec succès', 'Fermer', { duration: 3000 });
                    },
                    error: (err) => {
                        console.error('Erreur lors de la suppression:', err);
                        this.snackBar.open('Erreur lors de la suppression du plat', 'Fermer', { duration: 3000 });
                        this.isLoading = false;
                    }
                });
            }
        });
    }

    editItem(item: MenuItem) {
        const dialogRef = this.dialog.open(MenuItemFormComponent, {
            width: '600px',
            maxWidth: '95vw',
            data: { menuItem: item, restaurantId: item.restaurantId }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.isLoading = true;
                this.loadAllItems();
                this.snackBar.open('Plat mis à jour avec succès', 'Fermer', { duration: 3000 });
            }
        });
    }

    addItem() {
        const dialogRef = this.dialog.open(MenuItemFormComponent, {
            width: '600px',
            maxWidth: '95vw',
            data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.isLoading = true;
                this.loadAllItems();
                this.snackBar.open('Plat créé avec succès', 'Fermer', { duration: 3000 });
            }
        });
    }

    getItemImage(item: MenuItem): string {
        return item.imageBase64 || 'assets/images/plat.png';
    }

    get filteredMenuItems(): MenuItem[] {
        const text = this.searchText.toLowerCase();
        return this.menuItems.filter(item =>
            (!this.selectedCategoryId || item.categoryId === this.selectedCategoryId) &&
            ((item.name && item.name.toLowerCase().includes(text)) ||
                (item.description && item.description.toLowerCase().includes(text)) ||
                this.getRestaurantName(item.restaurantId).toLowerCase().includes(text))
        );
    }
} 