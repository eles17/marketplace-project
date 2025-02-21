import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private apiUrl = `${environment.apiUrl}/marketplace`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getListings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listings`, { headers: this.getAuthHeaders() });
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
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found, authentication failed.");
      return throwError(() => new Error("Unauthorized: No token provided"));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.patch<any>(`${this.apiUrl}/listings/${id}`, updatedListing, { headers });
  }
}