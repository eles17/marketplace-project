import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode'; // Ensure you install: npm install jwt-decode

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';
  private user: any;

  constructor(private http: HttpClient, private router: Router) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.router.navigate(['/dashboard']); // Redirect after login
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token); // Decode JWT properly
      return decoded.id || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return !!this.user; // Return true if there's a user object
  }

  // Check if the user is an admin (based on your user role)
  isAdmin(): boolean {
    return this.user?.role === 'admin'; // Assuming role is 'admin'
  }
}