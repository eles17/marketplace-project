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
        console.log('Full login response:', response); // Log the full response
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          console.log("Stored User in LocalStorage: ", response.user); // Debugging
          
          // Wait a moment before redirecting to ensure LocalStorage is updated
          setTimeout(() => {
            console.log("Redirecting after login...");
            console.log("User isAdmin:", this.isAdmin());
            console.log("User isLoggedIn:", this.isLoggedIn());
          
            if (this.isAdmin() && this.isLoggedIn()) {
              console.log("Redirecting to /admin");
              this.router.navigate(['/admin']);
            } else {
              console.log("Redirecting to /dashboard");
              this.router.navigate(['/dashboard']);
            }
          }, 500);
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

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return token !== null;  // If token exists, user is logged in
}

  isAdmin(): boolean {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return false;  // If no user is stored, return false
  
    try {
      const user = JSON.parse(storedUser); // Parse the user data
      console.log("Checking Admin Role: ", user); // Debugging log
      return user.is_admin === true;  // Explicitly check for boolean true
    } catch (error) {
      console.error("Error parsing user data:", error);
      return false;
    }
  }

  // Example of setting a user (you would call this in the login process)
  setUser(user: any): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  register(userData: { full_name: string, email: string, password: string, address: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
  }
}
