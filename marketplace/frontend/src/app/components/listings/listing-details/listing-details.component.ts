import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListingsService } from '../../../core/services/listings.service';

@Component({
  selector: 'app-listing-details',
  standalone: false,
  templateUrl: './listing-details.component.html',
  styleUrls: ['./listing-details.component.scss']
})
export class ListingDetailsComponent implements OnInit {
  listing: any;
  listingId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private listingsService: ListingsService
  ) {}

  ngOnInit(): void {
    this.listingId = Number(this.route.snapshot.paramMap.get('id')); // Convert ID to number
    if (!this.listingId) {
      console.error("Invalid listing ID");
      return;
    }
    this.fetchListingDetails();
  }

  fetchListingDetails(): void {
    if (this.listingId) {
      this.listingsService.getListingById(this.listingId).subscribe(
        (data) => this.listing = data,
        (error) => console.error("Error fetching listing details:", error)
      );
    }
  }
}