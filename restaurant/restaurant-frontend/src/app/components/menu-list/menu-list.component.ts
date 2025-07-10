import { Component, Input, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <h3>Menu</h3>
    <mat-list>
      <mat-list-item *ngFor="let item of menuItems">
        {{ item.name }} - {{ item.price | currency }}
        <button mat-icon-button color="warn" (click)="delete(item.id)">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-list-item>
    </mat-list>
  `,
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {
  @Input() restaurantId!: string;
  menuItems: MenuItem[] = [];

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    if (this.restaurantId) {
      this.loadMenu();
    }
  }

  loadMenu() {
    this.menuService.getMenuItemsByRestaurant(this.restaurantId).subscribe(data => {
      this.menuItems = data;
    });
  }

  delete(id?: string) {
    if (!id) return;
    this.menuService.deleteMenuItem(id).subscribe(() => {
      this.menuItems = this.menuItems.filter(i => i.id !== id);
    });
  }
}
