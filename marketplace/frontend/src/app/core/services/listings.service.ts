import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private apiUrl = `${environment.apiUrl}/marketplace`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`, { headers: this.getAuthHeaders() });
  }

  getListings(filters: any = {}): Observable<any[]> {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.min_price) params.append('min_price', filters.min_price.toString());
    if (filters.max_price) params.append('max_price', filters.max_price.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
  
    return this.http.get<any[]>(`${this.apiUrl}/listings?${params.toString()}`, { headers: this.getAuthHeaders() });
  }

  getListingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/listings/${id}`, { headers: this.getAuthHeaders() });
  }

  createListing(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/listings`, formData, { headers: this.getAuthHeaders() });
  }

  deleteListing(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/listings/${id}`, { headers: this.getAuthHeaders() });
  }

  updateListing(id: number, updatedListing: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/listings/${id}`, updatedListing, { headers: this.getAuthHeaders() });
  }
}