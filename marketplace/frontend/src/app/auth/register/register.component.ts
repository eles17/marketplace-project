import { Component } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerData = { full_name: '', email: '', password: '', address: '' };
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onRegister() {
    this.apiService.register(this.registerData).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']); // Redirect to login after successful registration
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Registration failed!';
      }
    });
  }
}
