import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListingsService } from '../../core/services/listings.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  recentListings: any[] = [];
  userListings: any[] = [];
  userName: string = '';

  constructor(
    private listingsService: ListingsService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRecentListings();
    this.loadUserListings();
    this.loadUserName();
  }

  loadRecentListings(): void {
    this.listingsService.getAllPublicListings().subscribe({
      next: (data) => {
        this.recentListings = data.slice(0, 5); // Show only the latest 5 listings
      },
      error: (err) => {
        console.error('Error fetching recent listings:', err);
      }
    });
  }

  loadUserListings(): void {
    const userId = this.authService.getUserId(); 
    if (!userId) return;

    this.listingsService.getUserListings(userId).subscribe({
      next: (data: any) => { 
        this.userListings = data;
      },
      error: (err: any) => { 
        console.error('Error fetching user listings:', err);
      }
    });
}

loadUserName(): void {
  const storedUser = localStorage.getItem('user'); 
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      this.userName = user.full_name || 'User'; 
    } catch (error) {
      console.error("Error parsing user data:", error);
      this.userName = 'User';
    }
  }
}

  viewListing(id: number, category: string): void {
    this.router.navigate([`/listings/${id}`], { queryParams: { type: category.toLowerCase() } });
  }

  editListing(id: number, category: string): void {
    this.router.navigate([`/listings/edit/${id}`], { queryParams: { type: category.toLowerCase() } });
  }

  deleteListing(id: number, category: string): void {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.listingsService.deleteListing(id, category.toLowerCase()).subscribe({
        next: () => {
          alert('Listing deleted successfully!');
          this.loadUserListings(); // Refresh user's listings
        },
        error: (err) => {
          console.error('Error deleting listing:', err);
          alert('Error deleting listing.');
        }
      });
    }
  }

  getCategoryName(categoryId: number): string {
    const categories: Record<number, string> = { 
      1: 'Retail',
      2: 'Vehicles',
      3: 'Real Estate'
    };
    return categories[categoryId] || 'Unknown';
}
}