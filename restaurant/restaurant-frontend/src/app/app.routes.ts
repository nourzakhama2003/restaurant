import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
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
        path: 'access-denied',
        component: AccessDeniedComponent
      },

      { path: 'register', component: RegisterComponent },
      { path: 'sign-in', component: LoginComponent },
    ],
  },
];
