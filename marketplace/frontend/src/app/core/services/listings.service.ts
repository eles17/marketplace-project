import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private apiUrl = 'http://localhost:5001/api/marketplace'; 

  constructor(private http: HttpClient) {}

// Fetch all listings
getListings(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/marketplace/listings`);
}

// Fetch a single listing by ID
getListingById(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/marketplace/listings/${id}`);
}
}