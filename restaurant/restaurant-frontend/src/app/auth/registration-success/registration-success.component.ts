import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registration-success.component.html',
  styleUrls: ['./registration-success.component.css'],
})
export class RegistrationSuccessComponent implements OnInit {

  constructor(
    private keycloak: KeycloakService,
    private router: Router
  ) { }

  async ngOnInit() {
    // If user is logged in (auto-logged in after registration), log them out
    if (this.keycloak.isLoggedIn()) {

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
