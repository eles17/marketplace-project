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
  user: any = {};
  listings: any[] = [];
  errorMessage: string = '';

  constructor(
    private listingsService: ListingsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.fetchUserListings();
  }

  loadUser(): void {
    this.user = this.authService.getUser();
  }

  fetchUserListings(): void {
    this.listingsService.getUserListings().subscribe({
      next: (data) => {
        this.listings = data;
      },
      error: (err) => {
        console.error("Error fetching user listings:", err);
        this.errorMessage = "Failed to load listings.";
      }
    });
  }

  editListing(id: number): void {
    this.router.navigate([`/listings/edit/${id}`]);
  }

  deleteListing(id: number, category: string): void {
    if (confirm("Are you sure you want to delete this listing?")) {
      this.listingsService.deleteListing(id, category).subscribe({
        next: () => {
          this.listings = this.listings.filter(listing => listing.id !== id);
          alert("Listing deleted successfully!");
        },
        error: (err) => {
          console.error("Error deleting listing:", err);
          alert("Error deleting listing.");
        }
      });
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getCategoryName(categoryId: number): string {
    const category = this.listingsService.getCategoryById(categoryId);
    return category ? category.name : "Unknown Category";
  }

  getSubCategoryName(subcategoryId: number): string {
    const subcategory = this.listingsService.getSubCategoryById(subcategoryId);
    return subcategory ? subcategory.name : "Unknown Subcategory";
  }
}