import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { CommandeService, Commande } from '../../services/commande.service';
import { UserService } from '../../services/user.service';
import { Restaurant } from '../../models/restaurant.model';

@Component({
    selector: 'app-create-group-order',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatSnackBarModule
    ],
    template: `
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <mat-card class="mt-4">
            <mat-card-header>
              <mat-card-title>Create commande</mat-card-title>
              <mat-card-subtitle>Start a group food order for your team</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <form [formGroup]="groupOrderForm" (ngSubmit)="onSubmit()" class="mt-3">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Select Restaurant</mat-label>
                      <mat-select formControlName="restaurantId" required>
                        <mat-option *ngFor="let restaurant of restaurants" [value]="restaurant.id">
                          {{restaurant.name}} - {{restaurant.cuisineType}}
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="groupOrderForm.get('restaurantId')?.hasError('required')">
                        Restaurant is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Your Name</mat-label>
                      <input matInput formControlName="creatorName" readonly>
                      <mat-hint>Automatically filled from your profile</mat-hint>
                    </mat-form-field>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Your User ID</mat-label>
                      <input matInput formControlName="creatorId" readonly>
                      <mat-hint>Automatically filled from your profile</mat-hint>
                    </mat-form-field>
                  </div>
                  
                  <div class="col-md-12 mb-3">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Delivery Address</mat-label>
                      <textarea matInput formControlName="deliveryAddress" rows="3" required></textarea>
                      <mat-error *ngIf="groupOrderForm.get('deliveryAddress')?.hasError('required')">
                        Delivery address is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Delivery Phone</mat-label>
                      <input matInput formControlName="deliveryPhone" required>
                      <mat-error *ngIf="groupOrderForm.get('deliveryPhone')?.hasError('required')">
                        Phone number is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Order Deadline</mat-label>
                      <input matInput [matDatepicker]="picker" formControlName="orderDeadline" required>
                      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                      <mat-datepicker #picker></mat-datepicker>
                      <mat-error *ngIf="groupOrderForm.get('orderDeadline')?.hasError('required')">
                        Order deadline is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                </div>
              </form>
            </mat-card-content>
            
            <mat-card-actions align="end">
              <button mat-button (click)="onCancel()" type="button">Cancel</button>
              <button mat-raised-button color="primary" (click)="onSubmit()" 
                      [disabled]="groupOrderForm.invalid || isLoading">
                {{isLoading ? 'Creating...' : 'Create Group Order'}}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .container-fluid {
      padding: 20px;
    }
    
    .mat-card {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .mat-form-field {
      margin-bottom: 16px;
    }
  `]
})
export class CreateGroupOrderComponent implements OnInit {
    groupOrderForm: FormGroup;
    restaurants: Restaurant[] = [];
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private restaurantService: RestaurantService,
        private commandeService: CommandeService,
        private userService: UserService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.groupOrderForm = this.fb.group({
            restaurantId: ['', Validators.required],
            creatorId: [''],
            creatorName: [''],
            deliveryAddress: ['', Validators.required],
            deliveryPhone: ['', Validators.required],
            orderDeadline: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadRestaurants();
        this.loadCurrentUser();
    }

    loadCurrentUser(): void {
        this.userService.getCurrentUserInfo().subscribe({
            next: (userInfo) => {
                if (userInfo) {
                    this.groupOrderForm.patchValue({
                        creatorId: userInfo.id,
                        creatorName: userInfo.name
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

    loadRestaurants(): void {
        this.restaurantService.getAllRestaurants().subscribe({
            next: (restaurants: Restaurant[]) => {
                this.restaurants = restaurants.filter((r: Restaurant) => !r.deleted);
            },
            error: (error: any) => {
                console.error('Error loading restaurants:', error);
                this.snackBar.open('Error loading restaurants', 'Close', { duration: 3000 });
            }
        });
    }

    onSubmit(): void {
        if (this.groupOrderForm.valid) {
            this.isLoading = true;

            const commande: any = {
                // id: Don't include id field - let MongoDB auto-generate it
                restaurantId: this.groupOrderForm.value.restaurantId,
                creatorId: this.groupOrderForm.value.creatorId,
                creatorName: this.groupOrderForm.value.creatorName,
                deliveryAddress: this.groupOrderForm.value.deliveryAddress,
                deliveryPhone: this.groupOrderForm.value.deliveryPhone,
                orderDeadline: new Date(this.groupOrderForm.value.orderDeadline),
                status: 'OPEN_FOR_PARTICIPATION',
                totalPrice: 0,
                allowParticipation: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                orders: [],
                deleted: false
            };

            this.commandeService.createCommande(commande).subscribe({
                next: (commande: Commande) => {
                    this.isLoading = false;
                    this.snackBar.open('Group order created successfully!', 'Close', { duration: 3000 });
                    this.router.navigate(['/group-orders/details', commande.id]);
                },
                error: (error: any) => {
                    this.isLoading = false;
                    console.error('Error creating group order:', error);
                    this.snackBar.open('Error creating group order', 'Close', { duration: 3000 });
                }
            });
        }
    }

    onCancel(): void {
        this.router.navigate(['/group-orders']);
    }
}
