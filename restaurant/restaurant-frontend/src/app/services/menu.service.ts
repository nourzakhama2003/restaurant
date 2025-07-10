import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  price: number;
  restaurantId: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseUrl = 'http://localhost:8081/api/menu-items';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') ?? '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getMenuItemsByRestaurant(restaurantId: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(
      `${this.baseUrl}/restaurant/${restaurantId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(
      this.baseUrl,
      item,
      { headers: this.getAuthHeaders() }
    );
  }

  updateMenuItem(id: string, item: MenuItem): Observable<MenuItem> {
    return this.http.put<MenuItem>(
      `${this.baseUrl}/${id}`,
      item,
      { headers: this.getAuthHeaders() }
    );
  }

 deleteMenuItem(id: string): Observable<void> {
   return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
 }
}
