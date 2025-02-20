import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private apiUrl = 'http://localhost:5001/api/marketplace'; 

  constructor(private http: HttpClient) {}

  // Fetch all listings (Public listings page)
  getListings(): Observable<any> {
  return this.http.get(`${this.apiUrl}/marketplace/listings`);
}
}