import { Component, OnInit } from '@angular/core';
import { ListingsService } from '../../core/services/listings.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-listings', 
  standalone: false,
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss'
})
export class ListingsComponent implements OnInit {
  listings: any[] = [];
  categories: any[] = [];
  userId: number | null = null;

  selectedMainCategory: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  searchQuery: string = '';
  sortOption: string = 'newest';

  constructor(private listingsService: ListingsService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadCategories();
    this.fetchListings();
  }

  loadCategories(): void {
    this.listingsService.getCategories().subscribe({
      next: (data: any[]) => { // Explicitly define type
        this.categories = data;
      },
      error: (err: any) => {  // Explicitly define type
        console.error("Error fetching categories:", err);
      }
    });
  }
  
  fetchListings(): void {
    this.listingsService.getListings({
      category: this.selectedMainCategory,
      min_price: this.minPrice,
      max_price: this.maxPrice,
      search: this.searchQuery,
      sort: this.sortOption
    }).subscribe({
      next: (data: any[]) => { // Explicitly define type
        this.listings = data;
      },
      error: (err: any) => { // Explicitly define type
        console.error("Error fetching listings:", err);
      }
    });
  }

  applyFilters(): void {
    this.fetchListings();
  }

  goToAddListing() {
    this.router.navigate(['/listings/add-listing']);
  }

  editListing(id: number): void {
    this.router.navigate([`/edit-listing/${id}`]);
  }

  deleteListing(id: number): void {
    if (confirm("Are you sure you want to delete this listing?")) {
      this.listingsService.deleteListing(id).subscribe(
        () => {
          this.listings = this.listings.filter(listing => listing.id !== id);
          alert("Listing deleted successfully!");
        },
        (error) => console.error("Error deleting listing:", error)
      );
    }
  }
}