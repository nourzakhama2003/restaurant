import { Routes } from '@angular/router';
import { RestaurantListComponent } from '../../components/restaurant-list/restaurant-list.component';


export const RestaurantRoutes: Routes = [
  {
    path: '',
    component: RestaurantListComponent,
  },
];
