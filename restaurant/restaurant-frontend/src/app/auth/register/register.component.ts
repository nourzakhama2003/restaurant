import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  isLoading = false;

  constructor(
    private keycloak: KeycloakService,
    private router: Router
  ) { }

  async onSubmit() {
    this.isLoading = true;
    try {
      // Use Keycloak's built-in registration flow
      // After registration, we'll redirect to a special page that handles the logout
      await this.keycloak.register({
        redirectUri: window.location.origin + '/registration-success'
      });
    } catch (error) {
      console.error('Registration failed:', error);
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
