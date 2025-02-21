import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}