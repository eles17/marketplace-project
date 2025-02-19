import { Component } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginData = {email: '', password: ''};
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onLogin() {
    this.apiService.login(this.loginData).subscribe({
      next: (response: any) => {
        localStorage.setItem('token', response.token); // Save token in local storage
        this.router.navigate(['/dashboard']); // Redirect to dashboard after login
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Login failed!';
      }
    });
  }
}