# 🔧 Practical Example: Adding Keycloak to Any Angular Project

## 📋 Checklist: What You Need for Every Project

### **✅ Step 1: Install Dependencies**
```bash
npm install keycloak-angular keycloak-js
```

### **✅ Step 2: Create Configuration Files**

#### File: `src/app/keycloak-init.ts`
```typescript
import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',      // ← Change to your Keycloak URL
        realm: 'your-app-realm',          // ← Change to your realm name
        clientId: 'your-app-client'       // ← Change to your client ID
      },
      initOptions: {
        onLoad: 'login-required',         // ← User must login to access app
        checkLoginIframe: false,
        redirectUri: window.location.origin,
        flow: 'standard',
        pkceMethod: 'S256'
      },
      bearerExcludedUrls: ['/assets', '/public'],
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer'
    });
}
```

#### File: `src/app/auth.interceptor.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token to public endpoints
    if (req.url.includes('/assets') || req.url.includes('/public')) {
      return next.handle(req);
    }

    return from(this.keycloak.getToken()).pipe(
      switchMap(token => {
        if (token) {
          const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(cloned);
        }
        return next.handle(req);
      })
    );
  }
}
```

#### File: `src/app/guards/auth.guard.ts`
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override router: Router,
    protected override keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  async isAccessAllowed(): Promise<boolean> {
    if (!this.authenticated) {
      await this.keycloak.login();
      return false;
    }
    return true;
  }
}
```

#### File: `src/app/services/keycloak.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { KeycloakService as OriginalKeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  constructor(private keycloak: OriginalKeycloakService) {}

  // Easy login method
  login(): void {
    this.keycloak.login();
  }

  // Easy logout method
  logout(): void {
    this.keycloak.logout(window.location.origin);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  // Get user information
  async getUserInfo(): Promise<any> {
    try {
      return await this.keycloak.loadUserProfile();
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  // Get username
  getUsername(): string {
    return this.keycloak.getUsername();
  }

  // Get user's roles
  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  // Get access token
  getToken(): Promise<string> {
    return this.keycloak.getToken();
  }
}
```

### **✅ Step 3: Update Main Application Files**

#### File: `src/main.ts`
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';

// Keycloak imports
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializeKeycloak } from './app/keycloak-init';
import { AuthInterceptor } from './app/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),

    // Keycloak initialization
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true
    },

    // Import Keycloak module
    importProvidersFrom(KeycloakAngularModule),

    // Register auth interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
}).catch((err: any) => console.error('Error starting application:', err));
```

#### File: `src/app/app.routes.ts`
```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes (no authentication required)
  { 
    path: 'public', 
    component: PublicComponent 
  },
  
  // Protected routes (authentication required)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]        // ← This protects the route
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]        // ← This protects the route
  },
  
  // Admin routes (admin role required)
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }      // ← Role-based protection
  },
  
  // Default route
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  }
];
```

### **✅ Step 4: Create Components That Use Authentication**

#### Example: Header Component with Login/Logout
```typescript
import { Component, OnInit } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="navbar">
      <div class="navbar-brand">My App</div>
      
      <div class="navbar-user" *ngIf="isLoggedIn">
        <span>Welcome, {{ username }}!</span>
        <button (click)="logout()" class="btn-logout">Logout</button>
      </div>
      
      <div *ngIf="!isLoggedIn">
        <button (click)="login()" class="btn-login">Login</button>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  username = '';

  constructor(private keycloakService: KeycloakService) {}

  async ngOnInit() {
    this.isLoggedIn = this.keycloakService.isLoggedIn();
    
    if (this.isLoggedIn) {
      this.username = this.keycloakService.getUsername();
    }
  }

  login() {
    this.keycloakService.login();
  }

  logout() {
    this.keycloakService.logout();
  }
}
```

#### Example: Role-Based Dashboard
```typescript
import { Component, OnInit } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      
      <!-- Content for all authenticated users -->
      <div class="user-content">
        <h2>Welcome {{ username }}!</h2>
        <p>Your roles: {{ userRoles.join(', ') }}</p>
      </div>
      
      <!-- Admin-only content -->
      <div *ngIf="isAdmin" class="admin-panel">
        <h2>Admin Panel</h2>
        <button (click)="manageUsers()">Manage Users</button>
        <button (click)="viewReports()">View Reports</button>
      </div>
      
      <!-- Manager-only content -->
      <div *ngIf="isManager" class="manager-panel">
        <h2>Manager Tools</h2>
        <button (click)="approveRequests()">Approve Requests</button>
      </div>
      
      <!-- Regular user content -->
      <div *ngIf="isUser" class="user-panel">
        <h2>User Actions</h2>
        <button (click)="submitRequest()">Submit Request</button>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  username = '';
  userRoles: string[] = [];
  isAdmin = false;
  isManager = false;
  isUser = false;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit() {
    this.username = this.keycloakService.getUsername();
    this.userRoles = this.keycloakService.getUserRoles();
    
    // Check roles
    this.isAdmin = this.keycloakService.hasRole('admin');
    this.isManager = this.keycloakService.hasRole('manager');
    this.isUser = this.keycloakService.hasRole('user');
  }

  manageUsers() {
    // Admin functionality
  }

  viewReports() {
    // Admin functionality
  }

  approveRequests() {
    // Manager functionality
  }

  submitRequest() {
    // User functionality
  }
}
```

---

## 🎯 Real-World Example: E-commerce App

### **Scenario:** You're building an e-commerce app with these user types:
- **Customer**: Can browse and buy products
- **Vendor**: Can manage their products
- **Admin**: Can manage everything

### **Keycloak Setup:**
1. **Realm**: `ecommerce-realm`
2. **Client**: `ecommerce-frontend`
3. **Roles**: `customer`, `vendor`, `admin`

### **Angular Implementation:**

#### Protected Routes
```typescript
export const routes: Routes = [
  // Public routes
  { path: 'home', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  
  // Customer routes
  { 
    path: 'cart', 
    component: CartComponent,
    canActivate: [AuthGuard],
    data: { roles: ['customer'] }
  },
  { 
    path: 'orders', 
    component: OrdersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['customer'] }
  },
  
  // Vendor routes
  { 
    path: 'vendor-dashboard', 
    component: VendorDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['vendor'] }
  },
  { 
    path: 'manage-products', 
    component: ManageProductsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['vendor'] }
  },
  
  // Admin routes
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  }
];
```

#### API Service with Authentication
```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  // Public endpoint - no auth needed
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  // Customer endpoint - token automatically added by interceptor
  addToCart(productId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart`, { productId });
  }

  // Vendor endpoint - token automatically added by interceptor
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/vendor/products`, product);
  }

  // Admin endpoint - token automatically added by interceptor
  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/products/${productId}`);
  }
}
```

---

## 🚀 Quick Setup Template for New Projects

### **1. Copy These Files to Any New Angular Project:**
```
src/app/
├── keycloak-init.ts
├── auth.interceptor.ts
├── guards/
│   └── auth.guard.ts
└── services/
    └── keycloak.service.ts
```

### **2. Update These Values:**
```typescript
// In keycloak-init.ts
config: {
  url: 'YOUR_KEYCLOAK_URL',
  realm: 'YOUR_REALM_NAME',
  clientId: 'YOUR_CLIENT_ID'
}
```

### **3. Add to main.ts:**
```typescript
// Import and register Keycloak providers
KeycloakService,
{ provide: APP_INITIALIZER, useFactory: initializeKeycloak, deps: [KeycloakService], multi: true },
importProvidersFrom(KeycloakAngularModule),
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

### **4. Protect Your Routes:**
```typescript
// Add canActivate: [AuthGuard] to protected routes
{ path: 'protected', component: YourComponent, canActivate: [AuthGuard] }
```

### **5. Use in Components:**
```typescript
// Inject KeycloakService and use its methods
constructor(private keycloakService: KeycloakService) {}

// Check login status
this.keycloakService.isLoggedIn()

// Check roles
this.keycloakService.hasRole('admin')

// Login/logout
this.keycloakService.login()
this.keycloakService.logout()
```

---

## 💡 Pro Tips

### **1. Environment-Based Configuration**
```typescript
// environment.ts
export const environment = {
  production: false,
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'dev-realm',
    clientId: 'dev-client'
  }
};

// environment.prod.ts
export const environment = {
  production: true,
  keycloak: {
    url: 'https://auth.yourcompany.com',
    realm: 'prod-realm',
    clientId: 'prod-client'
  }
};
```

### **2. Error Handling**
```typescript
// In your service
getProtectedData(): Observable<any> {
  return this.http.get('/api/protected').pipe(
    catchError(error => {
      if (error.status === 401) {
        // Token expired - redirect to login
        this.keycloakService.login();
      }
      throw error;
    })
  );
}
```

### **3. Loading States**
```typescript
// Show loading while Keycloak initializes
@Component({
  template: `
    <div *ngIf="!keycloakReady" class="loading">
      Initializing authentication...
    </div>
    <app-main *ngIf="keycloakReady"></app-main>
  `
})
export class AppComponent implements OnInit {
  keycloakReady = false;

  ngOnInit() {
    // Wait for Keycloak to initialize
    setTimeout(() => {
      this.keycloakReady = true;
    }, 1000);
  }
}
```

This template gives you everything you need to add Keycloak authentication to any Angular project! 🎉
