import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationSuccessComponent } from './auth/registration-success/registration-success.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default route - let the auth guard handle the redirect
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Public routes (no authentication required)
  {
    path: '',
    component: BlankComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'sign-in', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'registration-success', component: RegistrationSuccessComponent },
      { path: 'access-denied', component: AccessDeniedComponent },
    ],
  },
  // Protected routes (authentication required)
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
    ],
  },
];
