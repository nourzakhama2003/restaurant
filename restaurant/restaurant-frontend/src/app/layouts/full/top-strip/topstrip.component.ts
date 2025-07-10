import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TablerIconsModule } from 'angular-tabler-icons';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topstrip',
  imports: [TablerIconsModule, MatButtonModule, MatMenuModule],
  templateUrl: './topstrip.component.html',
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
