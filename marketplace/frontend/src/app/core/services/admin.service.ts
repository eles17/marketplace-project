import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  /** Get all users */
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() });
  }

  /** Get all listings for admin */
  getAllListings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listings`, { headers: this.getAuthHeaders() });
  }

  /** Ban a user */
  banUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/ban`, {}, { headers: this.getAuthHeaders() });
  }

  /** Unban a user */
  unbanUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/unban`, {}, { headers: this.getAuthHeaders() });
  }

  /** Delete a user */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.getAuthHeaders() });
  }

  /** Delete a listing as an admin */
  deleteListingAsAdmin(listingId: number, type: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${type}/${listingId}`, { headers: this.getAuthHeaders() });
  }
}