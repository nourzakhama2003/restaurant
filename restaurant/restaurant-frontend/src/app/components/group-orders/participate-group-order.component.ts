import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CommandeService, Commande, OrderItem } from '../../services/commande.service';
import { MenuService } from '../../services/menu.service';
import { UserService } from '../../services/user.service';
import { OrderService } from '../../services/order.service';
import { MenuItem } from '../../models/menu-item.model';
import { OrderSubmissionComponent } from '../order-submission/order-submission.component';

// Define interfaces for participation
interface ParticipateRequest {
    commandeId: string;
    participantId: string;
    participantName: string;
    participantPhone: string;
    items: OrderItem[];
    notes?: string;
}

@Component({
    selector: 'app-participate-group-order',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTableModule
    ],
    template: `
    <div class="container-fluid" *ngIf="commande">
      <div class="row">
        <div class="col-12">
          <h2>Join Group Order</h2>
          <p class="text-muted">Add your order to the group</p>
        </div>
      </div>
      
      <!-- Group Order Info -->
      <div class="row mb-4">
        <div class="col-12">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Group Order Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Created by:</strong> {{commande.creatorName}}</p>
                  <p><strong>Delivery Address:</strong> {{commande.deliveryAddress}}</p>
                  <p><strong>Phone:</strong> {{commande.deliveryPhone}}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Order Deadline:</strong> {{formatDate(commande.orderDeadline)}}</p>
                  <p><strong>Current Total:</strong> {{commande.totalPrice | currency:'USD':'symbol':'1.2-2'}}</p>
                  <p><strong>Participants:</strong> {{commande.orders?.length || 0}}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
      
      <!-- Participation Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Join this Group Order</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>You can submit your order to join this group order. The deadline is {{formatDate(commande.orderDeadline)}}.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="openOrderSubmissionDialog()">
                <mat-icon>add_shopping_cart</mat-icon>
                Submit New Order
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
      
      <!-- Participation Form -->
      <div class="row" style="display: none;">  <!-- Hidden the old form for now -->
        <div class="col-lg-8">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Your Order</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="participateForm" (ngSubmit)="onSubmit()">
                <!-- Personal Info -->
                <div class="row mb-3">
                  <div class="col-md-4">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Your Name</mat-label>
                      <input matInput formControlName="participantName" readonly>
                      <mat-hint>Automatically filled from your profile</mat-hint>
                    </mat-form-field>
                  </div>
                  <div class="col-md-4">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Your User ID</mat-label>
                      <input matInput formControlName="participantId" readonly>
                      <mat-hint>Automatically filled from your profile</mat-hint>
                    </mat-form-field>
                  </div>
                  <div class="col-md-4">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Your Phone</mat-label>
                      <input matInput formControlName="participantPhone" required>
                    </mat-form-field>
                  </div>
                </div>
                
                <!-- Menu Items Selection -->
                <h4>Select Menu Items</h4>
                <div formArrayName="items">
                  <div *ngFor="let itemForm of itemsFormArray.controls; let i = index" 
                       [formGroupName]="i" class="item-row mb-3">
                    <mat-card class="p-3">
                      <div class="row align-items-center">
                        <div class="col-md-4">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Menu Item</mat-label>
                            <select matNativeControl formControlName="menuItemId" (change)="onMenuItemChange(i)">
                              <option value="">Select item...</option>
                              <option *ngFor="let item of menuItems" [value]="item.id">
                                {{item.name}} - {{item.price | currency:'USD':'symbol':'1.2-2'}}
                              </option>
                            </select>
                          </mat-form-field>
                        </div>
                        <div class="col-md-2">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Quantity</mat-label>
                            <input matInput type="number" formControlName="quantity" min="1" 
                                   (input)="calculateSubtotal(i)">
                          </mat-form-field>
                        </div>
                        <div class="col-md-3">
                          <mat-form-field appearance="outline" class="w-100">
                            <mat-label>Special Notes</mat-label>
                            <input matInput formControlName="notes">
                          </mat-form-field>
                        </div>
                        <div class="col-md-2">
                          <p class="mb-0"><strong>Subtotal:</strong></p>
                          <p class="mb-0">{{getSubtotal(i) | currency:'USD':'symbol':'1.2-2'}}</p>
                        </div>
                        <div class="col-md-1">
                          <button mat-icon-button color="warn" (click)="removeItem(i)" type="button">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </div>
                    </mat-card>
                  </div>
                </div>
                
                <div class="mb-3">
                  <button mat-button (click)="addItem()" type="button">
                    <mat-icon>add</mat-icon>
                    Add Another Item
                  </button>
                </div>
                
                <!-- Order Notes -->
                <div class="row mb-3">
                  <div class="col-12">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Order Notes</mat-label>
                      <textarea matInput formControlName="notes" rows="3"></textarea>
                    </mat-form-field>
                  </div>
                </div>
                
                <!-- Total -->
                <div class="row mb-3">
                  <div class="col-12 text-end">
                    <h4>Your Total: {{getTotalAmount() | currency:'USD':'symbol':'1.2-2'}}</h4>
                  </div>
                </div>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button (click)="onCancel()" type="button">Cancel</button>
              <button mat-raised-button color="primary" (click)="onSubmit()" 
                      [disabled]="participateForm.invalid || isLoading || itemsFormArray.length === 0">
                {{isLoading ? 'Adding...' : 'Add to Group Order'}}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
        
        <!-- Current Participants -->
        <div class="col-lg-4">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Current Participants</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="commande.orders && commande.orders.length > 0; else noParticipants">
                <div *ngFor="let order of commande.orders" class="participant-card mb-2">
                  <div class="d-flex justify-content-between">
                    <strong>{{order.participantName}}</strong>
                    <span>{{order.totalAmount | currency:'USD':'symbol':'1.2-2'}}</span>
                  </div>
                  <small class="text-muted">{{order.items?.length || 0}} items</small>
                </div>
              </div>
              <ng-template #noParticipants>
                <p class="text-muted">No participants yet. Be the first!</p>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .container-fluid {
      padding: 20px;
    }
    
    .item-row {
      border-left: 4px solid #e0e0e0;
      padding-left: 16px;
    }
    
    .participant-card {
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background-color: #f9f9f9;
    }
    
    .mat-form-field {
      margin-bottom: 0;
    }
  `]
})
export class ParticipateGroupOrderComponent implements OnInit {
    commande: Commande | null = null;
    menuItems: MenuItem[] = [];
    participateForm: FormGroup;
    isLoading = false;
    commandeId: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private commandeService: CommandeService,
        private menuService: MenuService,
        private userService: UserService,
        private orderService: OrderService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.participateForm = this.fb.group({
            participantId: [''],
            participantName: [''],
            participantPhone: ['', Validators.required],
            items: this.fb.array([]),
            notes: ['']
        });
    }

    ngOnInit(): void {
        this.commandeId = this.route.snapshot.paramMap.get('id') || '';
        if (this.commandeId) {
            this.loadCommande();
        }
        this.loadCurrentUser();
    }

    loadCurrentUser(): void {
        this.userService.getCurrentUserInfo().subscribe({
            next: (userInfo) => {
                if (userInfo) {
                    this.participateForm.patchValue({
                        participantId: userInfo.id,
                        participantName: userInfo.name
                    });
                } else {
                    this.snackBar.open('Unable to load user information', 'Close', { duration: 3000 });
                }
            },
            error: (error: any) => {
                console.error('Error loading user information:', error);
                this.snackBar.open('Error loading user information', 'Close', { duration: 3000 });
            }
        });
    }

    get itemsFormArray(): FormArray {
        return this.participateForm.get('items') as FormArray;
    }

    loadCommande(): void {
        this.commandeService.getCommandeById(this.commandeId).subscribe({
            next: (commande: Commande) => {
                this.commande = commande;
                this.loadMenuItems();
                this.addItem(); // Add one item by default
            },
            error: (error: any) => {
                console.error('Error loading commande:', error);
                this.snackBar.open('Error loading group order', 'Close', { duration: 3000 });
            }
        });
    }

    loadMenuItems(): void {
        if (this.commande?.restaurantId) {
            this.menuService.getMenuItemsByRestaurant(this.commande.restaurantId).subscribe({
                next: (items: MenuItem[]) => {
                    this.menuItems = items.filter((item: MenuItem) => !item.deleted);
                },
                error: (error: any) => {
                    console.error('Error loading menu items:', error);
                    this.snackBar.open('Error loading menu items', 'Close', { duration: 3000 });
                }
            });
        }
    }

    addItem(): void {
        const itemForm = this.fb.group({
            menuItemId: ['', Validators.required],
            menuItemName: [''],
            unitPrice: [0],
            quantity: [1, [Validators.required, Validators.min(1)]],
            notes: ['']
        });
        this.itemsFormArray.push(itemForm);
    }

    removeItem(index: number): void {
        this.itemsFormArray.removeAt(index);
    }

    onMenuItemChange(index: number): void {
        const itemForm = this.itemsFormArray.at(index);
        const menuItemId = itemForm.get('menuItemId')?.value;
        const menuItem = this.menuItems.find(item => item.id === menuItemId);

        if (menuItem) {
            itemForm.patchValue({
                menuItemName: menuItem.name,
                unitPrice: menuItem.price
            });
        }
        this.calculateSubtotal(index);
    }

    calculateSubtotal(index: number): void {
        // Trigger change detection for subtotal calculation
    }

    getSubtotal(index: number): number {
        const itemForm = this.itemsFormArray.at(index);
        const quantity = itemForm.get('quantity')?.value || 0;
        const unitPrice = itemForm.get('unitPrice')?.value || 0;
        return quantity * unitPrice;
    }

    getTotalAmount(): number {
        let total = 0;
        for (let i = 0; i < this.itemsFormArray.length; i++) {
            total += this.getSubtotal(i);
        }
        return total;
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
    }

    onSubmit(): void {
        if (this.participateForm.valid && this.itemsFormArray.length > 0) {
            this.isLoading = true;

            const items: OrderItem[] = this.itemsFormArray.value.map((item: any) => ({
                menuItemId: item.menuItemId,
                menuItemName: item.menuItemName,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                notes: item.notes
            }));

            // For now, just show success message
            // TODO: Implement actual order creation via backend API
            setTimeout(() => {
                this.isLoading = false;
                this.snackBar.open('Order submission functionality will be implemented soon!', 'Close', { duration: 3000 });
                console.log('Order data that would be submitted:', {
                    commandeId: this.commandeId,
                    participantId: this.participateForm.value.participantId,
                    participantName: this.participateForm.value.participantName,
                    participantPhone: this.participateForm.value.participantPhone,
                    items: items,
                    notes: this.participateForm.value.notes
                });
            }, 1000);
        }
    }

    onCancel(): void {
        this.router.navigate(['/group-orders']);
    }

    openOrderSubmissionDialog(): void {
        const dialogRef = this.dialog.open(OrderSubmissionComponent, {
            width: '1000px',
            maxWidth: '95vw',
            data: {
                commandeId: this.commandeId,
                restaurantId: this.commande?.restaurantId
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Order was submitted successfully
                this.snackBar.open('Order submitted successfully!', 'Close', { duration: 3000 });
                // Refresh the commande to show updated orders
                this.loadCommande();
            }
        });
    }
}
