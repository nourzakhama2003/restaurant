import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private keycloak: KeycloakService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.keycloak.isLoggedIn();

    // Ici tu définis le rôle requis
   const hasRole = this.keycloak.isUserInRole('ADMIN_RESTAURANT', 'myclient');
    if (isLoggedIn && hasRole) {
      return true;
    }

    this.router.navigate(['/access-denied']);
    return false;
  }
}
