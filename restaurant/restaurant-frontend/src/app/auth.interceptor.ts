import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth for assets and public endpoints
    if (req.url.includes('/assets') || req.url.includes('/public')) {
      return next.handle(req);
    }

    return from(this.keycloak.getToken()).pipe(
      switchMap(token => {
        if (token) {
          console.log('Adding Bearer token to request:', req.url);
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(cloned);
        } else {
          console.warn('No token available for request:', req.url);
          return next.handle(req);
        }
      }),
      catchError((error) => {
        console.error('Error in auth interceptor:', error);
        throw error;
      })
    );
  }
}
