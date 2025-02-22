import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Make sure AuthService is imported

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log("Checking Admin Guard...");
    const isLoggedIn = this.authService.isLoggedIn();
    const isAdmin = this.authService.isAdmin();

    console.log("User isLoggedIn:", isLoggedIn);
    console.log("User isAdmin:", isAdmin);

    if (isLoggedIn && isAdmin) {
        console.log("Access granted to Admin Panel");
        return true;
    }

    console.warn("Access Denied: Redirecting to Login");
    this.router.navigate(['/auth/login']);
    return false;
}
}