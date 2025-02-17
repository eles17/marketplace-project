import { Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = { full_name: '', email: '', password: '', address: '' };
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onRegister() {
    this.apiService.register(this.registerData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || "Registration failed!";
      }
    });
  }
}