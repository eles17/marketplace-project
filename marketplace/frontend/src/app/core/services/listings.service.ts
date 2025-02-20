import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


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
  return this.http.post<any>(`${this.apiUrl}/add-listings`, formData);
}
}