import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private apiUrl = `${environment.apiUrl}/marketplace`;

  constructor(private http: HttpClient) {}

// Fetch all listings
getListings(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/listings`);
}

// Fetch a single listing by ID
getListingById(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/listings/${id}`);
}

createListing(formData: FormData): Observable<any> {
  const token = localStorage.getItem('token'); // Retrieve token from storage
  if (!token) {
    console.error("No token found, authentication failed.");
    return throwError(() => new Error("Unauthorized: No token provided"));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`, // Ensure "Bearer " prefix is added
  });

  return this.http.post<any>(`${this.apiUrl}/listings`, formData, { headers });
}
}