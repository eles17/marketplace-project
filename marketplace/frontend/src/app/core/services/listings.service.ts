import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  // Fetch all public listings (FOR NORMAL USERS)
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`, { headers: this.getAuthHeaders() });
  }
  
  getSubcategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subcategories`, { headers: this.getAuthHeaders() });
  }
  
  getAllPublicListings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listings`, { headers: this.getAuthHeaders() });
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`, { headers: this.getAuthHeaders() });
  }

  getVehicles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vehicles`, { headers: this.getAuthHeaders() });
  }

  getRealEstate(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/real-estate`, { headers: this.getAuthHeaders() });
  }

  getListingById(id: number, type: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${type}/${id}`, { headers: this.getAuthHeaders() });
  }

  createListing(formData: FormData, type: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${type}`, formData, { headers: this.getAuthHeaders() });
  }

  deleteListing(id: number, type: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${type}/${id}`, { headers: this.getAuthHeaders() });
  }

  updateListing(id: number, updatedListing: FormData, type: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${type}/${id}`, updatedListing, { headers: this.getAuthHeaders() });
  }

  
}