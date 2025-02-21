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
  listing: any;
  userId: number | null = null; // Store logged-in user ID

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingsService: ListingsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId(); // Retrieve logged-in user ID

    const listingId = Number(this.route.snapshot.paramMap.get('id'));
    this.listingsService.getListingById(listingId).subscribe({
      next: (data: any) => {
        this.listing = data;
      },
      error: (err: any) => {
        console.error('Error fetching listing details:', err);
      }
    });
  }

  editListing(): void {
    this.router.navigate([`/edit-listing/${this.listing.id}`]);
  }

  deleteListing(): void {
    if (confirm("Are you sure you want to delete this listing?")) {
      this.listingsService.deleteListing(this.listing.id).subscribe(
        () => {
          alert("Listing deleted successfully!");
          this.router.navigate(['/listings']);
        },
        (error) => console.error("Error deleting listing:", error)
      );
    }
  }
}