import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OrderSubmissionComponent } from '../order-submission/order-submission.component';
import { CommandeService, Commande } from '../../services/commande.service';
import { OrderItem } from '../../models/order-item.model';
import { MenuService } from '../../services/menu.service';
import { UserService } from '../../services/user.service';
import { OrderService } from '../../services/order.service';
import { MenuItem } from '../../models/menu-item.model';
import { CountdownService } from '../../services/counttdown.service';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface ParticipateRequest {
  commandeId: string;
  participantId: string;
  participantName: string;
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
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './participate-group-order.component.html',
  styleUrls: ['./participate-group-order.component.css']
})
export class ParticipateGroupOrderComponent implements OnInit, OnDestroy {
  commande: Commande | null = null;
  menuItems: MenuItem[] = [];
  participateForm: FormGroup;
  isLoading = false;
  commandeId: string = '';
  countdownDisplay: string = 'Calculating...';
  countdownColor: string = 'time-normal';
  private countdownSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private commandeService: CommandeService,
    private menuService: MenuService,
    private userService: UserService,
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private countdownService: CountdownService,
    private dialogRef: MatDialogRef<ParticipateGroupOrderComponent>
  ) {
    this.participateForm = this.fb.group({
      participantId: [''],
      participantName: [''],
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

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.commandeId) {
      this.countdownService.stopCountdown(this.commandeId);
    }
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
        if (this.countdownSubscription) {
          this.countdownSubscription.unsubscribe();
        }
        this.countdownSubscription = this.countdownService.startCountdown(commande).subscribe(countdown => {
          this.countdownDisplay = countdown.display;
          this.countdownColor = countdown.color;
        });
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


      const orderData = {
        commandeId: this.commandeId,
        participantId: this.participateForm.value.participantId,
        participantName: this.participateForm.value.participantName,
        items: items,
        totalAmount: this.getTotalAmount(),
        notes: this.participateForm.value.notes
      };

      this.orderService.createOrder(orderData).subscribe({
        next: (createdOrder) => {
          this.isLoading = false;
          this.snackBar.open('Order submitted successfully!', 'Close', { duration: 3000 });

          this.updateCommandeTotalInDatabase();


          this.dialogRef.close(createdOrder);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating order:', error);
          this.snackBar.open('Error submitting order. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/group-orders']);
  }

  openOrderSubmissionDialog(): void {

    if (!this.isParticipationOpen()) {
      this.snackBar.open('Participation time has expired for this group order.', 'Close', { duration: 3000 });
      return;
    }

    if (!this.commande || !this.commande.restaurantId) {
      this.snackBar.open('Error: Restaurant information not available. Please try again.', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(OrderSubmissionComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: {
        commandeId: this.commandeId,
        restaurantId: this.commande.restaurantId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.snackBar.open('Order submitted successfully!', 'Close', { duration: 3000 });

        this.loadCommande();

        this.updateCommandeTotalInDatabase();
      }
    });
  }


  updateCommandeTotalInDatabase(): void {
    if (!this.commande || !this.commandeId) {
      console.warn('⚠️ Cannot update total: commande or commandeId is missing');
      return;
    }




    this.orderService.getOrdersByCommandeId(this.commandeId).subscribe({
      next: (orders) => {
        const validOrders = orders.filter(order => !order.deleted);
        const newTotal = this.calculateCommandeTotal(validOrders);




        this.commandeService.updateCommandeTotal(this.commandeId, newTotal).subscribe({
          next: (updatedCommande) => {



            if (this.commande) {
              this.commande.totalPrice = newTotal;

            }
          },
          error: (error) => {
            console.error('❌ Error updating commande total in database:', error);
            this.snackBar.open('Error updating order total. Please try again.', 'Close', { duration: 3000 });
          }
        });
      },
      error: (error) => {
        console.error('❌ Error loading orders for total calculation:', error);
        this.snackBar.open('Error calculating order total. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }


  calculateCommandeTotal(orders: any[]): number {
    return orders.reduce((total, order) => {
      return total + (order.totalAmount || 0);
    }, 0);
  }


  isParticipationOpen(): boolean {
    if (!this.commande) return false;
    const now = new Date().getTime();
    const deadline = new Date(this.commande.orderDeadline).getTime() - (60 * 60 * 1000); // UTC offset as in CountdownService
    return this.commande.status === 'created' && now < deadline && this.commande.allowParticipation !== false;
  }


  getParticipationStatus(): string {
    if (!this.commande) return 'Unknown';

    if (!this.commande.allowParticipation) {
      return 'Closed by Creator';
    }

    return this.isParticipationOpen() ? 'Open for Participation' : 'Participation Closed';
  }


  getParticipationStatusClass(): string {
    return this.isParticipationOpen() ? 'status-open' : 'status-closed';
  }


  getRemainingTime(): string {
    return this.countdownDisplay;
  }

  getRemainingTimeClass(): string {
    return this.countdownColor;
  }

  goToMyOrders(): void {
    this.router.navigate(['/group-orders/my-orders']);
  }

  goBack(): void {
    this.router.navigate(['/group-orders']);
  }
}
