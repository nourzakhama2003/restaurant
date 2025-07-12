import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AppKeycloakService } from './keycloak.service';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string; // Changed from 'number' to 'phone' to match backend
    commandes?: any[];
    orders?: any[];
    deleted?: boolean;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    phone?: string; // Changed from 'number' to 'phone' to match backend
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(
        private http: HttpClient,
        private keycloakService: AppKeycloakService
    ) { }

    // Get current logged-in user information
    getCurrentUser(): Observable<User | null> {
        const email = this.keycloakService.getCurrentUserEmail();
        if (!email) {
            return of(null);
        }

        return this.getUserByEmail(email).pipe(
            catchError(() => {
                // If user doesn't exist in database, create them
                return this.createUserFromKeycloak();
            })
        );
    }

    // Get user by email
    getUserByEmail(email: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/email/${email}`);
    }

    // Get user by ID
    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    // Get all users
    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    // Create user from Keycloak information
    createUserFromKeycloak(): Observable<User> {
        const username = this.keycloakService.getCurrentUsername();
        const email = this.keycloakService.getCurrentUserEmail();
        const fullName = this.keycloakService.getCurrentUserFullName();

        console.log('Creating user from Keycloak data:', { username, email, fullName });

        if (!email) {
            throw new Error('Unable to get user email from Keycloak');
        }

        const createRequest: CreateUserRequest = {
            name: fullName || username || 'Unknown User',
            email: email
            // Note: Phone numbers will be collected during order creation
        };

        console.log('Creating user with request:', createRequest);

        return this.createUser(createRequest);
    }

    // Create a new user
    createUser(user: CreateUserRequest): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    // Update user
    updateUser(id: string, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    // Delete user
    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Get current user ID and name for commands
    getCurrentUserInfo(): Observable<{ id: string, name: string } | null> {
        return this.getCurrentUser().pipe(
            map(user => {
                if (user) {
                    return {
                        id: user.id,
                        name: user.name
                    };
                }
                return null;
            })
        );
    }

    // Initialize user when app starts (ensures user exists in database)
    initializeCurrentUser(): Observable<User | null> {
        if (!this.keycloakService.isLoggedIn()) {
            return of(null);
        }

        return this.getCurrentUser();
    }
}
