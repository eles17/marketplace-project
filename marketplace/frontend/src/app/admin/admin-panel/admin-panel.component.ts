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

  constructor(
    private listingsService: ListingsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.listingsService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  banUser(id: number): void {
    this.listingsService.updateUserStatus(id, 'banned').subscribe({
      next: () => {
        alert('User banned successfully!');
        this.fetchUsers(); // Refresh the list
      },
      error: (err) => {
        console.error('Error banning user:', err);
        alert('Error banning user.');
      }
    });
  }

  unbanUser(id: number): void {
    this.listingsService.updateUserStatus(id, 'active').subscribe({
      next: () => {
        alert('User unbanned successfully!');
        this.fetchUsers(); // Refresh the list
      },
      error: (err) => {
        console.error('Error unbanning user:', err);
        alert('Error unbanning user.');
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.listingsService.deleteUser(id).subscribe(
        () => {
          alert('User deleted successfully!');
          this.fetchUsers(); // Refresh the list
        },
        (err) => {
          console.error('Error deleting user:', err);
          alert('Error deleting user.');
        }
      );
    }
  }
}