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

    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true
    },

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

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
}).catch((err: any) => { });
