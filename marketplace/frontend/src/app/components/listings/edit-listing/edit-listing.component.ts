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
    const listingId = Number(this.route.snapshot.paramMap.get('id'));
    const listingType = this.route.snapshot.queryParamMap.get('type') || 'products';
  
    this.listingsService.getListingById(listingId, listingType).subscribe({
      next: (data) => {
        this.listing = data;
      },
      error: (err) => {
        console.error('Error fetching listing:', err);
      }
    });
  }
  
  updateListing(): void {
    const listingType = this.listing.type || 'products';
    
    this.listingsService.updateListing(this.listing.id, this.listing, listingType).subscribe({
      next: () => {
        alert("Listing updated successfully!");
      },
      error: (err) => {
        console.error("Error updating listing:", err);
      }
    });
  }

  // Public method for cancel button
  cancel(): void {
    this.router.navigate(['/listings']);
  }
}