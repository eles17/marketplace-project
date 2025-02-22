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
      },
      error: (err) => {
        this.errorMessage = 'Error fetching listing details.';
        console.error('Error fetching listing details:', err);
        this.isLoading = false;
      }
    });
  }

  // **Fix: Add missing editListing() method**
  editListing(): void {
    this.router.navigate([`/listings/edit/${this.listing.id}`], {
      queryParams: { type: this.listing.type }
    });
  }

  updateListing(): void {
    if (!this.listing.title || !this.listing.description || !this.listing.price || isNaN(this.listing.price) || !this.listing.category) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    const category = parseInt(this.listing.category, 10);
    const subcategory = this.listing.subcategory ? parseInt(this.listing.subcategory, 10) : null;
    const listingType = this.listing.type || 'products';

    const formData = new FormData();
    formData.append("title", this.listing.title);
    formData.append("description", this.listing.description);
    formData.append("price", this.listing.price.toString());
    formData.append("category", category.toString());
    formData.append("subcategory", subcategory ? subcategory.toString() : "");

    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    this.listingsService.updateListing(this.listing.id, formData, listingType).subscribe({
      next: () => {
        alert("Listing updated successfully!");
        this.router.navigate(['/listings']);
      },
      error: (err) => {
        console.error("Error updating listing:", err);
        alert("Error updating listing.");
      }
    });
  }

  deleteListing(id: number, type: string): void {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      this.listingsService.deleteListing(id, type).subscribe({
        next: () => {
          alert(`${type} deleted successfully!`);
          this.router.navigate(['/listings']);
        },
        error: (err) => {
          console.error(`Error deleting ${type}:`, err);
          alert(`Error deleting ${type}.`);
        }
      });
    }
  }

  isValidListing(): boolean {
    return !!(this.listing.title && this.listing.description &&
      this.listing.price && !isNaN(this.listing.price) &&
      this.listing.category);
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    formData.append("title", this.listing.title);
    formData.append("description", this.listing.description);
    formData.append("price", this.listing.price.toString());
    formData.append("category", this.listing.category.toString());

    if (this.listing.subcategory) {
      formData.append("subcategory", this.listing.subcategory.toString());
    }

    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    return formData;
  }

  getListingType(): string {
    switch (this.listing.category) {
      case 1:
        return 'products';
      case 2:
        return 'vehicles';
      case 3:
        return 'real-estate';
      default:
        return 'products';
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Please select a JPG or PNG image.");
        return;
      }
      this.selectedFile = file;
    }
  }
}