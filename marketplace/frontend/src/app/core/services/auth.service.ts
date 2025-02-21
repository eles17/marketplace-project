import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      console.log("Decoded User ID:", decoded.id);
      return decoded.id || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        console.log("Login Response:", response); // Debugging
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user)); // Store user data
          console.log("Stored Token:", localStorage.getItem('token')); // Debugging
          console.log("Stored User:", localStorage.getItem('user')); // Debugging
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token'); // Retrieve token for requests
  }
}