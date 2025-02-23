import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingsService } from '../../../core/services/listings.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-listing-details',
  standalone: false,
  templateUrl: './listing-details.component.html',
  styleUrls: ['./listing-details.component.scss']
})
export class ListingDetailsComponent implements OnInit {
  listing: any = {}; // Store listing details
  seller: any = {}; // Store seller details
  userId: number | null = null; // Logged-in user ID
  isLoading: boolean = true; // Show loading spinner
  errorMessage: string = ''; // Store error messages
  selectedFile: File | null = null; // Store selected file for upload

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingsService: ListingsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    const listingId = Number(this.route.snapshot.paramMap.get('id'));
    const listingType = this.route.snapshot.queryParamMap.get('type') || 'products';

    if (!listingId) {
      this.errorMessage = 'Invalid listing ID.';
      this.isLoading = false;
      return;
    }

    this.listingsService.getListingById(listingId, listingType).subscribe({
      next: (data) => {
        this.listing = data;
        this.isLoading = false;

        if (this.listing.user_id) {
          this.fetchSellerInfo(this.listing.user_id);
        }
      },
      error: (err) => {
        this.errorMessage = 'Error fetching listing details.';
        console.error('Error fetching listing details:', err);
        this.isLoading = false;
      }
    });
  }

  // Fetch seller information
  fetchSellerInfo(userId: number): void {
    this.listingsService.getSellerById(userId).subscribe({
      next: (data) => {
        this.seller = data;
      },
      error: (err) => {
        console.error('Error fetching seller info:', err);
      }
    });
  }

  // Check if the logged-in user is the owner of the listing
  isOwner(): boolean {
    return this.userId === this.listing?.user_id;
  }

  // Navigate to edit listing page
  editListing(): void {
    this.router.navigate([`/listings/edit/${this.listing.id}`], {
      queryParams: { type: this.listing.main_category }
    });
  }

  // Delete the listing
  deleteListing(): void {
    if (confirm(`Are you sure you want to delete this listing?`)) {
      this.listingsService.deleteListing(this.listing.id, this.listing.main_category).subscribe({
        next: () => {
          alert(`Listing deleted successfully!`);
          this.router.navigate(['/listings']);
        },
        error: (err) => {
          console.error(`Error deleting listing:`, err);
          alert(`Error deleting listing.`);
        }
      });
    }
  }

  // Contact seller (future implementation)
  contactSeller(): void {
    alert(`Feature coming soon: Contact ${this.seller.full_name}`);
  }

  // Get category name from category ID
  getCategoryName(categoryId: number): string {
    const categories: { [key: number]: string } = {
      1: 'Retail',
      2: 'Vehicles',
      3: 'Real Estate',
      4: 'Electronics',
      5: 'Fashion',
      6: 'Home Goods',
      7: 'Cars',
      8: 'Motorcycles',
      9: 'Trucks',
      10: 'Apartments',
      11: 'Houses',
      12: 'Commercial Properties'
    };
    return categories[categoryId] || 'Unknown';
  }

  // Get subcategory name from subcategory ID
  getSubCategoryName(subcategoryId: number): string {
    const subcategories: { [key: number]: string } = {
      4: 'Electronics',
      5: 'Fashion',
      6: 'Home Goods',
      7: 'Cars',
      8: 'Motorcycles',
      9: 'Trucks',
      10: 'Apartments',
      11: 'Houses',
      12: 'Commercial Properties'
    };
    return subcategories[subcategoryId] || 'None';
  }
}