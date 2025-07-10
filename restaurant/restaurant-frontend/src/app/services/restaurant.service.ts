import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private apiUrl = 'http://localhost:8081/api/restaurants';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') ?? '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

deleteRestaurant(id: string): Observable<void> {
  const token = localStorage.getItem('access_token') ?? '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
}

updateRestaurant(id: string, data: Partial<Restaurant>): Observable<Restaurant> {
  const token = localStorage.getItem('access_token') ?? '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.put<Restaurant>(`${this.apiUrl}/${id}`, data, { headers });
}

createRestaurant(data: Partial<Restaurant>): Observable<Restaurant> {
  const token = localStorage.getItem('access_token') ?? '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.post<Restaurant>(this.apiUrl, data, { headers });
}

}
