import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role-guard';

import { RestaurantListComponent } from '../components/restaurant-list/restaurant-list.component';
import { RestaurantFormDialogComponent } from '../components/restaurant-form/restaurant-form-dialog.component';


export const RestaurantRoutes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    children: [
      {
        path: '',
        component: RestaurantListComponent
      },
      {
        path: 'form',
        component: RestaurantFormDialogComponent
      }
    ]
  }
];
