import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListingsService } from '../../core/services/listings.service'; // Assuming the service is used for both listings and users
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: false,
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = []; // Store users data
  isLoading = false; //loading state

  constructor(
    private listingsService: ListingsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.listingsService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading = false;
      }
    });
  }

  banUser(id: number): void {
    this.listingsService.banUser(id).subscribe({
      next: () => {
        alert('User banned successfully!');
        this.fetchUsers();
      },
      error: (err) => {
        console.error('Error banning user:', err);
        alert('Failed to ban user.');
      }
    });
}

unbanUser(id: number): void {
    this.listingsService.unbanUser(id).subscribe({
      next: () => {
        alert('User unbanned successfully!');
        this.fetchUsers();
      },
      error: (err) => {
        console.error('Error unbanning user:', err);
        alert('Failed to unban user.');
      }
    });
}

deleteUser(id: number): void {
  if (confirm('Are you sure you want to delete this user?')) {
    this.listingsService.deleteUser(id).subscribe({
      next: () => {
        alert('User deleted successfully!');
        this.fetchUsers(); 
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert('Error deleting user.');
      }
    });
  }
}
}