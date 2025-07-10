import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseUrl = `${environment.apiUrl}/menu-items`;

  constructor(private http: HttpClient) { }

  getMenuItemsByRestaurant(restaurantId: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/restaurant/${restaurantId}`);
  }

  createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.baseUrl, item);
  }

  updateMenuItem(id: string, item: MenuItem): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/${id}`, item);
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
