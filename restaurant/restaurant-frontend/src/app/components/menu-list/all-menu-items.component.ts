import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { MenuItemFormComponent } from '../menu-item-form/menu-item-form.component';
import { ConfirmDialogComponent } from '../../confirm-dialog.component';
import { HlmSpinnerComponent } from '@spartan-ng/helm/spinner';

@Component({
    selector: 'app-all-menu-items',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, HlmSpinnerComponent],
    templateUrl: './all-menu-items.component.html',
    styleUrls: ['./menu-list.component.css']
})
export class AllMenuItemsComponent implements OnInit, AfterViewInit {
    menuItems: MenuItem[] = [];
    restaurants: Restaurant[] = [];
    searchText: string = '';
    isLoading = false;
    @ViewChildren('menuCard', { read: ElementRef }) cards!: QueryList<ElementRef>;

    constructor(
        private menuService: MenuService,
        private restaurantService: RestaurantService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.loadAllItems();
        this.restaurantService.getAllRestaurants().subscribe(data => {
            this.restaurants = data;
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

        // Observe initial cards
        this.cards.forEach(card => observer.observe(card.nativeElement));

        // Re-observe whenever the list changes (e.g., after filtering or loading)
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
                this.isLoading = false;
            }
        });
    }

    getRestaurantName(restaurantId: string): string {
        const rest = this.restaurants.find(r => r.id === restaurantId);
        return rest ? rest.name : restaurantId;
    }

    delete(id?: string) {
        if (!id) return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: { message: 'Are you sure you want to delete this menu item?' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.isLoading = true;
                this.menuService.deleteMenuItem(id).subscribe(() => {
                    this.menuItems = this.menuItems.filter(i => i.id !== id);
                    this.isLoading = false;
                });
            }
        });
    }

    editItem(item: MenuItem) {
        const dialogRef = this.dialog.open(MenuItemFormComponent, {
            width: '400px',
            data: { menuItem: item, restaurantId: item.restaurantId }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.isLoading = true;
                this.loadAllItems();
            }
        });
    }

    addItem() {
        const dialogRef = this.dialog.open(MenuItemFormComponent, {
            width: '400px',
            data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.isLoading = true;
                this.loadAllItems();
            }
        });
    }

    getItemImage(item: MenuItem): string {
        return item.imageBase64 || 'assets/images/plat.png';
    }

    get filteredMenuItems(): MenuItem[] {
        const text = this.searchText.toLowerCase();
        return this.menuItems.filter(item =>
            (item.name && item.name.toLowerCase().includes(text)) ||
            (item.description && item.description.toLowerCase().includes(text)) ||
            this.getRestaurantName(item.restaurantId).toLowerCase().includes(text)
        );
    }
} 