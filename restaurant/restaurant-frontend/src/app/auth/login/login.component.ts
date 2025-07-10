import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  showRegistrationSuccess = false;
  returnUrl = '/dashboard';

  constructor(
    private keycloak: KeycloakService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    // Get the return URL from query parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Check if user is already logged in
    const isLoggedIn = await this.keycloak.isLoggedIn();

    if (isLoggedIn) {
      // Check if this is a redirect from registration
      const currentUrl = this.router.url;
      if (currentUrl.includes('/login') || currentUrl.includes('/sign-in')) {
        // User was auto-logged in after registration, show success message and logout
        this.showRegistrationSuccess = true;
        console.log('User auto-logged in after registration, logging out...');

        // Logout after 3 seconds to allow manual login
        setTimeout(async () => {
          try {
            await this.keycloak.logout(window.location.origin + '/login');
          } catch (error) {
            console.error('Logout failed:', error);
            // If logout fails, just reload the page to clear the session
            window.location.reload();
          }
        }, 3000);
      } else {
        // Normal logged in user, redirect to intended destination
        await this.router.navigate([this.returnUrl]);
      }
    }
  }

  async login() {
    this.isLoading = true;
    try {
      await this.keycloak.login({
        redirectUri: window.location.origin + this.returnUrl
      });
    } catch (error) {
      console.error('Login failed:', error);
      this.isLoading = false;
    }
  }

  async register() {
    this.isLoading = true;
    try {
      await this.keycloak.register({
        redirectUri: window.location.origin + '/registration-success'
      });
    } catch (error) {
      console.error('Registration failed:', error);
      this.isLoading = false;
    }
  }
}
