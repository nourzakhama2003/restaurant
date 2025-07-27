// Polyfill for 'global' in browser
(window as any).global = window;

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TablerIconsModule } from 'angular-tabler-icons';
import { IconLogout, IconUser, IconHome, IconMail } from 'angular-tabler-icons/icons';
import { AuthInterceptor } from './app/auth.interceptor';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializeKeycloak } from './app/keycloak-init';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr');

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
      BrowserAnimationsModule,
      KeycloakAngularModule,
      TablerIconsModule.pick({
        IconLogout,
        IconUser,
        IconHome,
        IconMail,
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
