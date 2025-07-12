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
        MatDividerModule
    ],
    template: `
    <div class="order-submission-dialog">
      <h1 mat-dialog-title>{{isEditMode ? 'Edit Your Order' : 'Submit Your Order'}}</h1>
      
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="orderForm">
          <!-- User Information (Auto-filled) -->
          <mat-card class="user-info-card mb-3">
            <mat-card-header>
              <mat-card-title>Your Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="row">
                <div class="col-md-6">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Your Name</mat-label>
                    <input matInput formControlName="participantName" readonly>
                  </mat-form-field>
                </div>
                <div class="col-md-6">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Phone Number *</mat-label>
                    <input matInput formControlName="participantPhone" required placeholder="Enter your phone number">
                    <mat-hint>Required for order delivery coordination</mat-hint>
                    <mat-error *ngIf="orderForm.get('participantPhone')?.hasError('required')">
                      Phone number is required for delivery
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Menu Items Selection -->
          <mat-card class="menu-items-card mb-3">
            <mat-card-header>
              <mat-card-title>Select Menu Items</mat-card-title>
              <button mat-icon-button type="button" (click)="addMenuItem()" class="add-item-btn">
                <mat-icon>add</mat-icon>
              </button>
            </mat-card-header>
            <mat-card-content>
              <!-- Loading state -->
              <div *ngIf="menuItems.length === 0" class="loading-message">
                <p>Loading menu items...</p>
              </div>
              
              <!-- Menu items form -->
              <div formArrayName="items" *ngIf="menuItems.length > 0">
                <div *ngFor="let item of orderItems.controls; let i = index" [formGroupName]="i" class="menu-item-row mb-3">
                  <mat-card class="item-card">
                    <mat-card-content>
                  <div class="row align-items-end">
                    <div class="col-md-5"> <!-- Increased from col-md-4 to col-md-5 -->
                      <mat-form-field appearance="outline" class="w-100">
                        <mat-label>Menu Item</mat-label>
                        <mat-select formControlName="menuItemId" (selectionChange)="onMenuItemSelect(i, $event.value)">
                          <mat-option *ngFor="let menuItem of menuItems" [value]="menuItem.id">
                            {{menuItem.name}} - \${{menuItem.price.toFixed(2)}}
                            <br><small class="text-muted">{{menuItem.description}}</small>
                          </mat-option>
                        </mat-select>
                        <mat-error *ngIf="item.get('menuItemId')?.hasError('required')">
                          Menu item is required
                        </mat-error>
                      </mat-form-field>
                    </div>
                    <div class="col-md-2">
                      <mat-form-field appearance="outline" class="w-100">
                        <mat-label>Quantity</mat-label>
                        <input matInput type="number" formControlName="quantity" min="1" 
                               (input)="calculateItemTotal(i)">
                        <mat-error *ngIf="item.get('quantity')?.hasError('required')">
                          Quantity is required
                        </mat-error>
                        <mat-error *ngIf="item.get('quantity')?.hasError('min')">
                          Minimum quantity is 1
                        </mat-error>
                      </mat-form-field>
                    </div>
                    <div class="col-md-3">
                      <mat-form-field appearance="outline" class="w-100">
                        <mat-label>Special Notes</mat-label>
                        <input matInput formControlName="notes" placeholder="e.g., no onions">
                      </mat-form-field>
                    </div>
                    <div class="col-md-1">
                      <div class="item-total">
                        <strong>\${{getItemSubtotal(i).toFixed(2)}}</strong>
                      </div>
                    </div>
                    <div class="col-md-1">
                      <button mat-icon-button type="button" (click)="removeMenuItem(i)" 
                              [disabled]="orderItems.length === 1" color="warn">
                        <mat-icon>remove</mat-icon>
                      </button>
                    </div>
                  </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
              
              <div *ngIf="orderItems.length === 0" class="no-items-message">
                <p>No items added yet. Click the + button to add menu items.</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Order Notes -->
          <mat-card class="notes-card mb-3">
            <mat-card-header>
              <mat-card-title>Additional Notes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Order Notes (Optional)</mat-label>
                <textarea matInput formControlName="notes" rows="3" 
                          placeholder="Any special instructions or requests..."></textarea>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Order Summary -->
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>Order Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="order-summary">
                <div class="summary-row">
                  <span>Total Items:</span>
                  <span>{{getTotalQuantity()}}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="summary-row total">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>\${{getTotalAmount()}}</strong></span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" 
                [disabled]="orderForm.invalid || isLoading || orderItems.length === 0">
          {{isLoading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Order' : 'Submit Order')}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .order-submission-dialog {
      width: 1200px; // Further increased to 1200px for better field visibility
      max-width: 98vw; // Increased to 98vw for maximum screen usage
      min-width: 900px; // Set minimum width to ensure proper layout
    }

    .dialog-content {
      max-height: 80vh; // Increased to 80vh for more content space
      overflow-y: auto;
      padding: 20px; // Increased padding for better spacing
    }

    .user-info-card,
    .menu-items-card,
    .notes-card,
    .summary-card {
      margin-bottom: 20px; // Increased spacing
    }

    .add-item-btn {
      margin-left: auto;
    }

    .item-card {
      background-color: #f8f9fa;
      margin-bottom: 12px; // Increased spacing
      border: 1px solid #e0e0e0;
    }

    .menu-item-row {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px; // Increased padding
      background-color: #fff;
      margin-bottom: 16px;
    }

    .item-total {
      text-align: center;
      padding: 12px;
      font-size: 18px; // Increased font size
      color: #2e7d32;
      font-weight: 600;
    }

    .no-items-message {
      text-align: center;
      color: #666;
      padding: 30px;
      font-size: 16px;
    }

    .loading-message {
      text-align: center;
      color: #666;
      padding: 30px;
      font-size: 16px;
      font-style: italic;
    }

    .order-summary {
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 16px;
    }

    .summary-row.total {
      font-size: 20px; // Increased font size
      color: #2e7d32;
      border-top: 2px solid #e0e0e0;
      margin-top: 10px;
      padding-top: 15px;
    }

    .w-100 {
      width: 100%;
    }

    .mb-3 {
      margin-bottom: 1.5rem; // Increased margin
    }

    // Better spacing for form fields
    .mat-form-field {
      margin-bottom: 12px; // Increased margin for better spacing
    }

    // Make menu item select dropdown wider and more readable
    .mat-select-panel {
      max-width: 500px !important; // Increased width for better visibility
      min-width: 400px !important; // Increased minimum width
    }

    // Better alignment for menu item rows with more space
    .row.align-items-end {
      min-height: 90px; // Increased height for better spacing
    }

    // Improve form field appearance
    .mat-form-field-appearance-outline .mat-form-field-outline {
      color: rgba(0,0,0,.12);
    }

    // Better spacing for cards
    .mat-card {
      padding: 20px; // Increased padding for cards
    }
  `]
})
export class OrderSubmissionComponent implements OnInit {
    orderForm: FormGroup;
    menuItems: MenuItem[] = [];
    isLoading = false;
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
            participantPhone: ['', Validators.required],
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
                        participantName: userInfo.name,
                        participantPhone: '' // User must provide phone number
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
            participantPhone: existingOrder.participantPhone,
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
        console.log('Loading menu items for restaurant ID:', this.data.restaurantId);
        // Use MenuService to load menu items directly, just like menu-dialog component
        this.menuService.getMenuItemsByRestaurant(this.data.restaurantId).subscribe({
            next: (menuItems: MenuItem[]) => {
                console.log('Menu items loaded from MenuService:', menuItems);
                // Filter for non-deleted items only
                this.menuItems = menuItems.filter((item: MenuItem) => !item.deleted);
                console.log('Filtered available menu items:', this.menuItems);
                console.log('Number of available menu items:', this.menuItems.length);
            },
            error: (error: any) => {
                console.error('Error loading menu items from MenuService:', error);
                this.snackBar.open('Error loading menu items', 'Close', { duration: 3000 });
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
                participantPhone: this.orderForm.value.participantPhone,
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
