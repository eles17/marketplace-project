import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userData: any;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getUserProfile().subscribe({
      next: (data) => {
        this.userData = data;
      },
      error: (err) => {
        console.error("Error fetching user data:", err);
      }
    });
  }
}