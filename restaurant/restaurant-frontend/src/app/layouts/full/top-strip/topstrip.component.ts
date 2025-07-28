import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TablerIconsModule } from 'angular-tabler-icons';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { routes } from '../../../app.routes';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-topstrip',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    TablerIconsModule,
    RouterModule
  ],
  templateUrl: './topstrip.component.html',
  styleUrls: ['./topstrip.css'],
})
export class AppTopstripComponent implements OnInit {
  @Input() isOver: boolean = false;
  visible = false;
  userName: string = 'User';
  userEmail: string = 'email non trouvé';
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

  async ngOnInit(): Promise<void> {
    try {
      const userProfile = await this.keycloak.loadUserProfile();
      this.userName = userProfile.username || 'User';
      this.userEmail = userProfile.email || 'email non trouvé';
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.userName = 'User';
      this.userEmail = 'email non trouvé';
    }
  }
}
