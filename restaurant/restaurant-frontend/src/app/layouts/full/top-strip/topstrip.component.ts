import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TablerIconsModule } from 'angular-tabler-icons';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { routes } from '../../../app.routes';
@Component({
  selector: 'app-topstrip',
  imports: [TablerIconsModule, MatButtonModule, MatMenuModule, MatIconModule, RouterModule],
  templateUrl: './topstrip.component.html',
  styleUrls: ['./topstrip.css'],
  standalone: true,
})
export class AppTopstripComponent {
  constructor(
    private router: Router,
    private keycloak: KeycloakService
  ) { }

  async onLogout(): Promise<void> {
    try {
      await this.keycloak.logout(window.location.origin + '/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  async logout() {
    try {
      await this.keycloak.logout(window.location.origin + '/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: redirect to login page
      this.router.navigate(['/login']);
    }
  }
  onOpenRestaurant(): void {
    this.router.navigate(['/restaurants']);
  }

  async getUserName(): Promise<string> {
    try {
      const userProfile = await this.keycloak.loadUserProfile();
      return userProfile.username || 'User';
    } catch (error) {
      return 'User';
    }
  }
}
