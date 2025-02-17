import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';


  constructor(private http: HttpClient) { }

  //login request
  login(credentials: any): Observable<any>{
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  //register request
  register(userData: any): Observable<any>{
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  //fetch listings
  getListings(): Observable<any>{
    return this.http.get(`${this.apiUrl}/marketplace/my-listings`);
  }

  //fetch categories
  getCategories(): Observable<any>{
    return this.http.get(`${this.apiUrl}/marketplace/categories`);
  }
}
