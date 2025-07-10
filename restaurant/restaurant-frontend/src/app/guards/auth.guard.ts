import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private keycloak: KeycloakService, private router: Router) { }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const isLoggedIn = await this.keycloak.isLoggedIn();

        if (isLoggedIn) {
            return true;
        }

        // Store the attempted URL for redirecting after login
        const returnUrl = state.url;
        console.log(`🔒 Access denied to ${returnUrl}. Redirecting to login.`);

        // Redirect to login page
        this.router.navigate(['/login'], {
            queryParams: { returnUrl }
        });

        return false;
    }
}
