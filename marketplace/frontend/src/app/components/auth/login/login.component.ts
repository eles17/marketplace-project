import { Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = { email: '', password: '' };
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onLogin() {
    this.apiService.login(this.loginData).subscribe({
      next: (response: any) => { 
        localStorage.setItem('token', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => { 
        this.errorMessage = err.error?.message || "Login failed!";
      }
    });
  }
}