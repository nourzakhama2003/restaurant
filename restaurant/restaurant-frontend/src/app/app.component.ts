import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'restaurant-frontend';

  constructor(
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Initialize current user when app starts
    this.userService.initializeCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          console.log('User initialized:', user.name);
        }
      },
      error: (error) => {
        console.error('Error initializing user:', error);
      }
    });
  }
}


