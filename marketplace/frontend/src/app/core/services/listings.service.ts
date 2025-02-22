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
    let queryParams = new URLSearchParams();

    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            if (key === 'category') {
                queryParams.append(key, String(parseInt(filters[key]))); 
            } else {
                queryParams.append(key, filters[key]);
            }
        }
    });

    return this.http.get<any[]>(`${this.apiUrl}/listings?${queryParams.toString()}`, { headers: this.getAuthHeaders() });
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


  //user management (Admin)
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>('/api/admin/users', { headers: this.getAuthHeaders() });
  }
  
  banUser(userId: number): Observable<any> {
    return this.http.put(`/api/admin/users/${userId}/ban`, {}, { headers: this.getAuthHeaders() });
  }
  
  unbanUser(userId: number): Observable<any> {
    return this.http.put(`/api/admin/users/${userId}/unban`, {}, { headers: this.getAuthHeaders() });
  }
  
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`/api/admin/users/${userId}`, { headers: this.getAuthHeaders() });
  }

  getAllListings(): Observable<any[]> {
    return this.http.get<any[]>('/api/admin/listings', { headers: this.getAuthHeaders() });
  }
  
  deleteListingAsAdmin(listingId: number): Observable<any> {
    return this.http.delete(`/api/admin/listings/${listingId}`, { headers: this.getAuthHeaders() });
  }
}