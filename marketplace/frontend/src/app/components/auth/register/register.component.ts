import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = { full_name: '', email: '', password: '', address: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    this.authService.register(this.user).subscribe({
      next: (response) => {
        alert("Registration successful! Please log in.");
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error("Registration Error:", err);
        this.errorMessage = err.error.message || "Registration failed.";
      }
    });
  }
}