import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { Router } from '@angular/router';

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
  isLoadingListings = false;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchListings();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching users:", err);
        this.isLoading = false;
      }
    });
  }

  fetchListings(): void {
    this.isLoadingListings = true;
    this.adminService.getAllListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.isLoadingListings = false;
      },
      error: (err) => {
        console.error("Error fetching listings:", err);
        this.isLoadingListings = false;
      }
    });
  }

  banUser(id: number): void {
    this.adminService.banUser(id).subscribe({
      next: () => {
        alert("User banned successfully!");
        this.fetchUsers();
      },
      error: (err) => {
        console.error("Error banning user:", err);
        alert("Failed to ban user.");
      }
    });
  }

  unbanUser(id: number): void {
    this.adminService.unbanUser(id).subscribe({
      next: () => {
        alert("User unbanned successfully!");
        this.fetchUsers();
      },
      error: (err) => {
        console.error("Error unbanning user:", err);
        alert("Failed to unban user.");
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm("Are you sure you want to delete this user?")) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          alert("User deleted successfully!");
          this.fetchUsers();
        },
        error: (err) => {
          console.error("Error deleting user:", err);
          alert("Error deleting user.");
        }
      });
    }
  }

  deleteListing(id: number, category: string): void {
    if (confirm(`Are you sure you want to delete this ${category} listing?`)) {
      this.adminService.deleteListingAsAdmin(id, category).subscribe({
        next: () => {
          alert(`${category} listing deleted successfully!`);
          this.fetchListings();
        },
        error: (err) => {
          console.error(`Error deleting ${category} listing:`, err);
          alert(`Error deleting ${category} listing.`);
        }
      });
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.listings.find((listing) => listing.category_id === categoryId);
    return category ? category.name : "Unknown Category";
  }
}