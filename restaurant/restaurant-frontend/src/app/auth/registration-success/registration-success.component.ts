import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h2>Registration Successful!</h2>
        <p>Your account has been created successfully.</p>
        <p>Redirecting to login page...</p>
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .success-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .success-card h2 {
      color: #28a745;
      margin-bottom: 10px;
      font-size: 24px;
    }

    .success-card p {
      color: #666;
      margin-bottom: 15px;
      font-size: 16px;
    }

    .loading-spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #28a745;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class RegistrationSuccessComponent implements OnInit {

  constructor(
    private keycloak: KeycloakService,
    private router: Router
  ) { }

  async ngOnInit() {
    // If user is logged in (auto-logged in after registration), log them out
    if (this.keycloak.isLoggedIn()) {
      console.log('User auto-logged in after registration, logging out...');
      try {
        // Wait 2 seconds to show the success message, then logout
        setTimeout(async () => {
          await this.keycloak.logout(window.location.origin + '/login');
        }, 2000);
      } catch (error) {
        console.error('Logout failed:', error);
        // If logout fails, just redirect to login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    } else {
      // User is not logged in, just redirect to login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }
}
