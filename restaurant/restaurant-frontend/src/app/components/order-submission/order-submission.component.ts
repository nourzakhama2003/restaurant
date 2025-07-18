import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OrderService } from '../../services/order.service';
import { RestaurantService } from '../../services/restaurant.service';
import { UserService } from '../../services/user.service';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { OrderItem, Order } from '../../models/group-order.model';

@Component({
  selector: 'app-order-submission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './order-submission.component.html',
  styleUrls: ['./order-submission.component.css']
})
export class OrderSubmissionComponent implements OnInit {
  orderForm: FormGroup;
  menuItems: MenuItem[] = [];
  isLoading = false;
  isLoadingMenuItems = false;
  isEditMode = false;
  existingOrderId: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrderSubmissionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      commandeId: string,
      restaurantId: string,
      editMode?: boolean,
      existingOrder?: Order
    },
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private userService: UserService,
    private menuService: MenuService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = data.editMode || false;
    this.orderForm = this.fb.group({
      participantId: [''],
      participantName: [''],
      items: this.fb.array([]),
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadMenuItems();
    if (this.isEditMode && this.data.existingOrder) {
      this.loadExistingOrder();
    } else {
      this.loadCurrentUser();
      this.addMenuItem(); // Add first menu item row
    }
  }

  get orderItems(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUserInfo().subscribe({
      next: (userInfo) => {
        if (userInfo) {
          this.orderForm.patchValue({
            participantId: userInfo.id,
            participantName: userInfo.name
          });
        }
      },
      error: (error) => {
        console.error('Error loading user information:', error);
      }
    });
  }

  loadExistingOrder(): void {
    const existingOrder = this.data.existingOrder!;
    this.existingOrderId = existingOrder.id;

    // Load user info first
    this.orderForm.patchValue({
      participantId: existingOrder.participantId,
      participantName: existingOrder.participantName,
      notes: existingOrder.notes || ''
    });

    // Clear existing items and add items from existing order
    this.clearOrderItems();
    existingOrder.items.forEach(item => {
      this.addMenuItemFromExisting(item);
    });
  }

  clearOrderItems(): void {
    while (this.orderItems.length !== 0) {
      this.orderItems.removeAt(0);
    }
  }

  addMenuItemFromExisting(existingItem: OrderItem): void {
    const itemGroup = this.fb.group({
      menuItemId: [existingItem.menuItemId, Validators.required],
      menuItemName: [existingItem.menuItemName],
      unitPrice: [existingItem.unitPrice],
      quantity: [existingItem.quantity, [Validators.required, Validators.min(1)]],
      notes: [existingItem.notes || '']
    });
    this.orderItems.push(itemGroup);
  }

    loadMenuItems(): void {
    if (!this.data.restaurantId) {
      console.error('Restaurant ID is missing from dialog data');
      this.snackBar.open('Error: Restaurant information is missing. Please try again.', 'Close', { duration: 3000 });
      this.menuItems = [];
      return;
    }

    this.isLoadingMenuItems = true;
    console.log('Loading menu items for restaurant ID:', this.data.restaurantId);
    // Use MenuService to load menu items directly, just like menu-dialog component
    this.menuService.getMenuItemsByRestaurant(this.data.restaurantId).subscribe({
      next: (menuItems: MenuItem[]) => {
        this.isLoadingMenuItems = false;
        console.log('Menu items loaded from MenuService:', menuItems);
        // Filter for non-deleted items only
        this.menuItems = menuItems.filter((item: MenuItem) => !item.deleted);
        console.log('Filtered available menu items:', this.menuItems);
        console.log('Number of available menu items:', this.menuItems.length);
        
        if (this.menuItems.length === 0) {
          this.snackBar.open('No menu items available for this restaurant.', 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        this.isLoadingMenuItems = false;
        console.error('Error loading menu items from MenuService:', error);
        this.snackBar.open('Error loading menu items. Please try again.', 'Close', { duration: 3000 });
        this.menuItems = [];
      }
    });
  }

  addMenuItem(): void {
    const menuItemGroup = this.fb.group({
      menuItemId: ['', Validators.required],
      menuItemName: [''],
      unitPrice: [0],
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
    this.orderItems.push(menuItemGroup);
  }

  removeMenuItem(index: number): void {
    if (this.orderItems.length > 1) {
      this.orderItems.removeAt(index);
    }
  }

  onMenuItemSelect(index: number, menuItemId: string): void {
    const selectedMenuItem = this.menuItems.find(item => item.id === menuItemId);
    if (selectedMenuItem) {
      const itemGroup = this.orderItems.at(index);
      itemGroup.patchValue({
        menuItemName: selectedMenuItem.name,
        unitPrice: selectedMenuItem.price
      });
      this.calculateItemTotal(index);
    }
  }

  calculateItemTotal(index: number): void {
    // This will trigger recalculation of totals
    // The template will automatically update via getItemSubtotal()
  }

  getItemSubtotal(index: number): number {
    const item = this.orderItems.at(index);
    const unitPrice = item.get('unitPrice')?.value || 0;
    const quantity = item.get('quantity')?.value || 0;
    return unitPrice * quantity;
  }

  getTotalQuantity(): number {
    let total = 0;
    for (let i = 0; i < this.orderItems.length; i++) {
      total += this.orderItems.at(i).get('quantity')?.value || 0;
    }
    return total;
  }

  getTotalAmount(): number {
    let total = 0;
    for (let i = 0; i < this.orderItems.length; i++) {
      total += this.getItemSubtotal(i);
    }
    return Number(total.toFixed(2));
  }

  onSubmit(): void {
    if (this.orderForm.valid && this.orderItems.length > 0) {
      this.isLoading = true;

      const orderData = {
        commandeId: this.data.commandeId,
        participantId: this.orderForm.value.participantId,
        participantName: this.orderForm.value.participantName,
        items: this.orderForm.value.items,
        totalAmount: this.getTotalAmount(),
        notes: this.orderForm.value.notes,
        createdAt: new Date(),
        deleted: false
      };

      if (this.isEditMode && this.existingOrderId) {
        // Update existing order
        const updateData = {
          id: this.existingOrderId,
          ...orderData
        };
        this.orderService.updateOrder(this.existingOrderId, updateData).subscribe({
          next: (order) => {
            this.isLoading = false;
            this.snackBar.open('Order updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(order);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating order:', error);
            this.snackBar.open('Error updating order', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Create new order
        this.orderService.createOrder(orderData).subscribe({
          next: (order) => {
            this.isLoading = false;
            this.snackBar.open('Order submitted successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(order);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error submitting order:', error);
            this.snackBar.open('Error submitting order', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
