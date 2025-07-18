import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem } from '../models/menu-item.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseUrl = `${environment.apiUrl}/menu-items`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getMenuItemsByRestaurant(restaurantId: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/restaurant/${restaurantId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.baseUrl, item, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateMenuItem(id: string, item: MenuItem): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/${id}`, item, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getAllMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.baseUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
