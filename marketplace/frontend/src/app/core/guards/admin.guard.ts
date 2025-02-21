import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Make sure AuthService is imported

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // Check if the user is logged in and is an admin
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    }

    // If not an admin, redirect to the login or some other page
    this.router.navigate(['/auth/login']);
    return false;
  }
}