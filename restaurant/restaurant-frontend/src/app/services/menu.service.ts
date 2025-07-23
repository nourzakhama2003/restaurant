import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem } from '../models/menu-item.model';
import { AuthService } from './auth.service';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseUrl = `${environment.apiUrl}/menu-items`;
  private categoryUrl = `${environment.apiUrl}/categories`;

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

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.categoryUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createCategory(category: Category) {
    return this.http.post<Category>(this.categoryUrl, category, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateCategory(id: string, category: Category) {
    return this.http.put<Category>(`${this.categoryUrl}/${id}`, category, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteCategory(id: string) {
    return this.http.delete<void>(`${this.categoryUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
