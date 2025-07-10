import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AppKeycloakService {
  constructor(private keycloak: KeycloakService) { }

  async initializeKeycloak(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        config: {
          url: 'http://localhost:8080',
          realm: 'myrealm',
          clientId: 'myclient'
        },
        initOptions: {
          onLoad: 'login-required',
          checkLoginIframe: false,
          redirectUri: window.location.origin
        }
      });

      if (authenticated) {
        const userProfile = await this.keycloak.loadUserProfile();
        console.log('Authenticated user:', userProfile.username);
      }

      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      return false;
    }
  }

  loginUser(): void {
    this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  logoutUser(): void {
    this.keycloak.logout(window.location.origin + '/login');
  }

  registerUser(): void {
    this.keycloak.register({
      redirectUri: window.location.origin + '/registered'
    });
  }

  getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }
}
