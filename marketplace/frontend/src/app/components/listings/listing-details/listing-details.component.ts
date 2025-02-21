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
  listing: any = {}; // Initialize the listing as an empty object
  userId: number | null = null; // Store logged-in user ID
  isLoading: boolean = true; // To manage loading state
  errorMessage: string = ''; // To hold error messages
  selectedFile: File | null = null; // To hold the selected file for the image

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingsService: ListingsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId(); // Retrieve logged-in user ID
  
    const listingId = Number(this.route.snapshot.paramMap.get('id'));
  
    if (!listingId) {
      this.errorMessage = 'Invalid listing ID.';
      this.isLoading = false;
      return;
    }
  
    // Fetch the listing details
    this.listingsService.getListingById(listingId).subscribe({
      next: (data: any) => {
        this.listing = data;
        console.log('Listing Data:', this.listing); // Log the listing data to check
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Error fetching listing details.';
        console.error('Error fetching listing details:', err);
        this.isLoading = false;
      }
    });
  }

  // Navigate to the edit listing page
  editListing(): void {
    // Validate the form fields
    if (!this.listing.title || !this.listing.description || !this.listing.price || isNaN(this.listing.price) || !this.listing.category) {
      alert("Please fill in all required fields correctly.");
      return;
    }
  
    // Ensure category and subcategory are integers before submitting
    const category = parseInt(this.listing.category, 10);
    const subcategory = this.listing.subcategory ? parseInt(this.listing.subcategory, 10) : null;
  
    // Prepare form data for submitting the update request
    const formData = new FormData();
    formData.append("title", this.listing.title);
    formData.append("description", this.listing.description);
    formData.append("price", this.listing.price.toString());
    formData.append("category", category.toString());
    formData.append("subcategory", subcategory ? subcategory.toString() : "");
  
    // If there's a selected file for the image, include it
    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }
  
    // Send the request to the backend
    this.listingsService.updateListing(this.listing.id, formData).subscribe({
      next: (response) => {
        alert("Listing updated successfully!");
        this.router.navigate(['/listings']);
      },
      error: (err) => {
        console.error("Error updating listing:", err);
        alert("Error updating listing.");
      }
    });
  }

  updateListing(): void {
  if (!this.listing.title || !this.listing.description || !this.listing.price || isNaN(this.listing.price) || !this.listing.category) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  const category = parseInt(this.listing.category, 10);
  const subcategory = this.listing.subcategory ? parseInt(this.listing.subcategory, 10) : null;

  const formData = new FormData();
  formData.append("title", this.listing.title);
  formData.append("description", this.listing.description);
  formData.append("price", this.listing.price.toString());
  formData.append("category", category.toString());
  formData.append("subcategory", subcategory ? subcategory.toString() : "");

  if (this.selectedFile) {
    formData.append("image", this.selectedFile);
  }

  this.listingsService.updateListing(this.listing.id, formData).subscribe({
    next: (response) => {
      alert("Listing updated successfully!");
      this.router.navigate(['/listings']);
    },
    error: (err) => {
      console.error("Error updating listing:", err);
      alert("Error updating listing.");
    }
  });
}

  // Delete the listing
  deleteListing(): void {
    if (confirm("Are you sure you want to delete this listing?")) {
      this.listingsService.deleteListing(this.listing.id).subscribe(
        () => {
          alert("Listing deleted successfully!");
          this.router.navigate(['/listings']); // Navigate back to the listings page
        },
        (error) => {
          console.error("Error deleting listing:", error);
          alert("Error deleting listing.");
        }
      );
    }
  }
}