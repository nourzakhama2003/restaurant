import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-registered',
  standalone: true,
  templateUrl: './registered.component.html'
})
export class RegisteredComponent implements OnInit {
  constructor(
    private router: Router,
    private keycloak: KeycloakService
  ) { }

  ngOnInit(): void {
    // Show registration success message
    console.log('Registration successful! Redirecting to login...');

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
