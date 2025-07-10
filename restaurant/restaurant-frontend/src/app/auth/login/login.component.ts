import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private keycloak: KeycloakService,
    private router: Router
  ) { }

  async ngOnInit() {
    // If user is already authenticated, redirect to dashboard
    if (this.keycloak.isLoggedIn()) {
      await this.router.navigate(['/dashboard']);
    }
  }

  async login() {
    this.isLoading = true;
    try {
      await this.keycloak.login({
        redirectUri: window.location.origin + '/dashboard'
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
        redirectUri: window.location.origin + '/registered'
      });
    } catch (error) {
      console.error('Registration failed:', error);
      this.isLoading = false;
    }
  }
}
