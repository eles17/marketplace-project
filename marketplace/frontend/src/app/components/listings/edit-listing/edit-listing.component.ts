import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingsService } from '../../../core/services/listings.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-edit-listing',
  standalone: false,
  templateUrl: './edit-listing.component.html',
  styleUrls: ['./edit-listing.component.scss']
})
export class EditListingComponent implements OnInit {
  listing: any = { title: '', description: '', price: null, category: null };
  userId: number | null = null; // Store logged-in user ID

  // Change router to public so template can use it
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private listingsService: ListingsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId(); // Get logged-in user ID
    const listingId = Number(this.route.snapshot.paramMap.get('id'));
    this.listingsService.getListingById(listingId).subscribe({
      next: (data: any) => {
        if (data.user_id !== this.userId) {
          alert("Unauthorized: You can only edit your own listings.");
          this.router.navigate(['/listings']);
        }
        this.listing = data;
      },
      error: (err: any) => {
        console.error('Error fetching listing details:', err);
      }
    });
  }

  updateListing(): void {
    this.listingsService.updateListing(this.listing.id, this.listing).subscribe(
      () => {
        alert("Listing updated successfully!");
        this.router.navigate([`/listings/${this.listing.id}`]); // Redirect after update
      },
      (error) => console.error("Error updating listing:", error)
    );
  }

  // Public method for cancel button
  cancel(): void {
    this.router.navigate(['/listings']);
  }
}