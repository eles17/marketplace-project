import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root' // Makes service available globally (NO NEED TO IMPORT IN A MODULE)
  })
  export class ApiService {
    private apiUrl = 'http://localhost:3000/api'; // Change this if needed
  
    constructor(private http: HttpClient) {}

    // User login
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  // User registration
  register(userData: { full_name: string, email: string, password: string, address: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  // Fetch user profile (to be used later)
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`);
  }
}