import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { IconLogout, IconUser, IconHome } from 'angular-tabler-icons/icons';
import { AuthInterceptor } from './app/auth.interceptor';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializeKeycloak } from './app/keycloak-init';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),

    // Keycloak providers
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true
    },

    // Import required modules
    importProvidersFrom(
      KeycloakAngularModule,
      TablerIconsModule.pick({
        IconLogout,
        IconUser,
        IconHome,
      })
    ),

    // HTTP Interceptor for adding Bearer token
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
}).catch((err: any) => console.error('Error starting application:', err));
