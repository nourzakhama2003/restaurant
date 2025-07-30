import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollAnimateDirective } from './scroll-animate.directive';
import { KeycloakService } from 'keycloak-angular';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterModule, ScrollAnimateDirective],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    constructor(private keycloak: KeycloakService) { }

    async login() {
        try {
            await this.keycloak.login({
                redirectUri: window.location.origin + '/dashboard'
            });
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    async register() {
        try {
            await this.keycloak.register({
                redirectUri: window.location.origin + '/registration-success'
            });
        } catch (error) {
            console.error('Registration failed:', error);
        }
    }
} 