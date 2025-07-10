# 🔐 Keycloak + Angular Integration Guide for Beginners

## 🎯 What is Keycloak and Why Use It?

**Keycloak** is an **Identity and Access Management (IAM)** solution that handles:
- ✅ User login/logout
- ✅ User registration  
- ✅ Password management
- ✅ Role-based access control
- ✅ Single Sign-On (SSO)
- ✅ Security tokens (JWT)

**Benefits:**
- 🚀 **No need to build your own login system**
- 🔒 **Enterprise-grade security**
- 🌐 **Works with any frontend framework**
- 📱 **Mobile app support**
- 🔄 **Easy user management**

---

## 🏗️ How Keycloak Works with Angular (The Big Picture)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Angular App   │◄──►│    Keycloak     │◄──►│   Your API      │
│  (Frontend)     │    │   (Auth Server) │    │   (Backend)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **The Flow:**
1. **User visits your Angular app**
2. **App redirects to Keycloak login page**
3. **User enters credentials in Keycloak**
4. **Keycloak sends user back to app with a token**
5. **App uses token to call your API**

---

## 🔧 Standard Integration Process (Step by Step)

### **Phase 1: Keycloak Setup**

#### 1.1 Install Keycloak
```bash
# Option A: Docker (Recommended)
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:25.0.5 start-dev

# Option B: Download and run locally
# Download from keycloak.org
```

#### 1.2 Create Realm
- **Realm** = Your application's security domain
- Think of it as a "workspace" for your app
- Default realm is "master" (don't use for apps)

```
Admin Console → Add Realm → Name: "myapp-realm"
```

#### 1.3 Create Client
- **Client** = Your Angular application
- Tells Keycloak which app is allowed to authenticate

```
Clients → Create → Client ID: "myapp-frontend"
```

#### 1.4 Configure Client Settings
```
Access Type: confidential
Valid Redirect URIs: http://localhost:4200/*
Web Origins: http://localhost:4200
```

### **Phase 2: Angular Setup**

#### 2.1 Install Keycloak Angular Library
```bash
npm install keycloak-angular keycloak-js
```

#### 2.2 Configure Keycloak in Angular
Create `src/app/keycloak-init.ts`:
```typescript
import { KeycloakOptions } from 'keycloak-angular';

export const keycloakConfig: KeycloakOptions = {
  config: {
    url: 'http://localhost:8080',
    realm: 'myapp-realm',
    clientId: 'myapp-frontend'
  },
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
  }
};
```

#### 2.3 Initialize Keycloak in App
Update `src/main.ts`:
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { keycloakConfig } from './app/keycloak-init';

function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init(keycloakConfig);
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(KeycloakAngularModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ]
});
```

#### 2.4 Create Auth Guard
Create `src/app/guards/auth.guard.ts`:
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
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

#### 2.5 Protect Routes
Update `src/app/app.routes.ts`:
```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]  // ← This protects the route
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
```

#### 2.6 Create Auth Interceptor
Create `src/app/auth.interceptor.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (this.keycloak.isLoggedIn()) {
      const token = this.keycloak.getToken();
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
```

---

## 📝 Key Concepts Every Beginner Should Know

### **1. Tokens (JWT)**
```typescript
// When user logs in, Keycloak gives you a token like this:
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

// Your API validates this token to know:
// - Who the user is
// - What permissions they have
// - If the token is still valid
```

### **2. Authentication vs Authorization**
- **Authentication** = "Who are you?" (Login)
- **Authorization** = "What can you do?" (Permissions)

```typescript
// Check if user is logged in (Authentication)
if (this.keycloak.isLoggedIn()) {
  // User is authenticated
}

// Check user's role (Authorization)
if (this.keycloak.isUserInRole('admin')) {
  // User can access admin features
}
```

### **3. Redirect Flow**
```
1. User clicks "Login" → Redirects to Keycloak
2. User enters password → Keycloak validates
3. Keycloak redirects back → With token in URL
4. Angular extracts token → Stores it securely
5. All API calls → Include token in headers
```

### **4. Environment Configuration**
Create `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'myapp-realm',
    clientId: 'myapp-frontend'
  },
  apiUrl: 'http://localhost:8081/api'
};
```

---

## 🛠️ Common Patterns and Best Practices

### **1. Login/Logout Service**
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private keycloak: KeycloakService) {}

  login() {
    this.keycloak.login();
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  getUserInfo() {
    return this.keycloak.getKeycloakInstance().loadUserProfile();
  }

  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }
}
```

### **2. Component Usage**
```typescript
@Component({
  template: `
    <div *ngIf="isLoggedIn">
      <h1>Welcome, {{username}}!</h1>
      <button (click)="logout()">Logout</button>
    </div>
    <div *ngIf="!isLoggedIn">
      <button (click)="login()">Login</button>
    </div>
  `
})
export class HeaderComponent {
  isLoggedIn = false;
  username = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.authService.getUserInfo().then(user => {
        this.username = user.username;
      });
    }
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
```

### **3. Role-Based UI**
```typescript
// In your component
@Component({
  template: `
    <div *ngIf="isAdmin">
      <button>Admin Panel</button>
    </div>
    <div *ngIf="isUser">
      <button>User Dashboard</button>
    </div>
  `
})
export class DashboardComponent {
  isAdmin = false;
  isUser = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAdmin = this.authService.hasRole('admin');
    this.isUser = this.authService.hasRole('user');
  }
}
```

---

## 🚀 Quick Setup Template for New Projects

### **1. Package Installation**
```bash
npm install keycloak-angular keycloak-js
```

### **2. Essential Files to Create**
```
src/app/
├── keycloak-init.ts         # Keycloak configuration
├── auth.interceptor.ts      # Auto-add tokens to requests
├── guards/
│   └── auth.guard.ts        # Protect routes
├── services/
│   └── auth.service.ts      # Login/logout methods
└── environments/
    └── environment.ts       # Environment config
```

### **3. Update These Files**
```
src/
├── main.ts                  # Initialize Keycloak
└── app/
    ├── app.routes.ts        # Add guards to routes
    └── app.config.ts        # Register interceptor
```

---

## 🔍 Debugging Tips

### **Check if Keycloak is Working**
```typescript
// In browser console
console.log('Is logged in:', this.keycloak.isLoggedIn());
console.log('Token:', this.keycloak.getToken());
console.log('User roles:', this.keycloak.getUserRoles());
```

### **Common Issues**
1. **Redirect URI mismatch** → Check Keycloak client settings
2. **CORS errors** → Add your domain to Web Origins
3. **Infinite redirect loop** → Check logout redirect URI
4. **Token not in API calls** → Verify interceptor is registered

---

## 📚 Summary: What You Need to Know

### **Keycloak Side (One-time setup per project)**
1. Create realm for your app
2. Create client (your Angular app)
3. Configure redirect URIs
4. Create test users

### **Angular Side (Development)**
1. Install `keycloak-angular`
2. Configure connection to Keycloak
3. Add auth guard to protect routes
4. Add interceptor to include tokens in API calls
5. Create login/logout UI

### **For Every New Project**
1. Copy the configuration files
2. Update realm/client names
3. Update URLs for your environment
4. Test the authentication flow

This pattern works for **any Angular project** - just change the realm name and URLs! 🎉
