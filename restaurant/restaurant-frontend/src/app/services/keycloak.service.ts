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

  // Get current user information from Keycloak
  async getCurrentUser(): Promise<any> {
    if (this.isLoggedIn()) {
      return await this.keycloak.loadUserProfile();
    }
    return null;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    if (this.isLoggedIn()) {
      const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
      return tokenParsed?.sub || null;
    }
    return null;
  }

  // Get current username
  getCurrentUsername(): string | null {
    if (this.isLoggedIn()) {
      const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
      return tokenParsed?.['preferred_username'] || null;
    }
    return null;
  }

  // Get current user email
  getCurrentUserEmail(): string | null {
    if (this.isLoggedIn()) {
      const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
      return tokenParsed?.['email'] || null;
    }
    return null;
  }

  // Get current user's full name
  getCurrentUserFullName(): string | null {
    if (this.isLoggedIn()) {
      const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
      const firstName = tokenParsed?.['given_name'] || '';
      const lastName = tokenParsed?.['family_name'] || '';
      return firstName && lastName ? `${firstName} ${lastName}` : tokenParsed?.['name'] || tokenParsed?.['preferred_username'] || null;
    }
    return null;
  }

  // Debug method to see all token fields (for development purposes)
  debugKeycloakToken(): void {
    if (this.isLoggedIn()) {
      const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
      console.log('All Keycloak token fields:', tokenParsed);
    }
  }
}
