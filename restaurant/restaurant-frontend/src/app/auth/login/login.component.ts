import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';





@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCheckboxModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  showRegistrationSuccess = false;
  returnUrl = '/dashboard';
  @ViewChild('container') container!: ElementRef;

  constructor(
    private keycloak: KeycloakService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    const fromRegistration = this.route.snapshot.queryParams['fromRegistration'] === 'true';

    
    const isLoggedIn = await this.keycloak.isLoggedIn();

    if (isLoggedIn) {
      if (fromRegistration) {
      
        this.showRegistrationSuccess = true;
        console.log('User auto-logged in after registration, logging out...');


        setTimeout(async () => {
          try {
            await this.keycloak.logout(window.location.origin + '/login');
          } catch (error) {
    
            window.location.reload();
          }
        }, 3000);
      } else {
     
        console.log('User already logged in, redirecting to:', this.returnUrl);
        this.router.navigate([this.returnUrl]);
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

  // Social login handler for provider buttons
  async loginWithProvider(provider: string) {
    this.isLoading = true;
    try {
   
      await this.keycloak.login({
        idpHint: provider,
        redirectUri: window.location.origin + this.returnUrl
      });
    } catch (error) {
      console.error('Social login failed:', error);
      this.isLoading = false;
    }
  }

  onSignUp() {
    this.container.nativeElement.classList.add('right-panel-active');
  }

  onSignIn() {
    this.container.nativeElement.classList.remove('right-panel-active');
  }
}
