import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationSuccessComponent } from './auth/registration-success/registration-success.component';
import { AuthGuard } from './guards/auth.guard';
import { MenuListComponent } from './components/menu-list/menu-list.component';
import { AllMenuItemsComponent } from './components/menu-list/all-menu-items.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactsComponent } from './pages/contacts/contacts.component';

export const routes: Routes = [
  {
    path: '',
    component: BlankComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'login', component: LoginComponent },

      { path: 'register', component: RegisterComponent },
      { path: 'registration-success', component: RegistrationSuccessComponent },
      { path: 'access-denied', component: AccessDeniedComponent },
      { path: 'contacts', component: ContactsComponent },
    ],
  },

  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then(m => m.PagesRoutes),
      },
      {
        path: 'restaurant',
        loadChildren: () =>
          import('./pages/restaurant/restaurant.routes').then(m => m.RestaurantRoutes),
      },
      {
        path: 'group-orders',
        loadChildren: () =>
          import('./pages/group-orders/group-orders.routes').then(m => m.GroupOrderRoutes),
      },
      {
        path: 'restaurants/:id/menu',
        component: MenuListComponent
      },
      {
        path: 'all-menu-items',
        component: AllMenuItemsComponent
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/category-management/category-management.component').then(m => m.CategoryManagementComponent),
      },
    ],
  },
];
