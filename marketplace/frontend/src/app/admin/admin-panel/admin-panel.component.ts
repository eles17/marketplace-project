import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: false,
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [];
  listings: any[] = [];
  isLoading = false;

  constructor(private adminService: AdminService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchListings();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
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

  fetchListings(): void {
    this.isLoading = true;
    this.adminService.getAllListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching listings:', err);
        this.isLoading = false;
      }
    });
  }

  banUser(id: number): void {
    this.adminService.banUser(id).subscribe({
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
    this.adminService.unbanUser(id).subscribe({
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
      this.adminService.deleteUser(id).subscribe({
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

  deleteListing(id: number, categoryId: number): void {
    const type = this.getListingType(categoryId); // Convert category_id to type
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      this.adminService.deleteListingAsAdmin(id, type).subscribe({
        next: () => {
          alert(`${type} deleted successfully!`);
          this.fetchListings();
        },
        error: (err) => {
          console.error(`Error deleting ${type}:`, err);
          alert(`Error deleting ${type}.`);
        }
      });
    }
  }
  
  getListingType(categoryId: number): string {
    switch (categoryId) {
      case 1: return 'products';
      case 2: return 'vehicles';
      case 3: return 'real-estate';
      default: return 'products';
    }
  }
}