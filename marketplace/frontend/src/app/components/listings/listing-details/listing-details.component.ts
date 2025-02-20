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

  constructor(
    private route: ActivatedRoute,
    private listingsService: ListingsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // Get ID from URL
    if (id) {
      this.listingsService.getListingById(+id).subscribe(
        (data) => {
          this.listing = data;
        },
        (error) => {
          console.error("Error fetching listing details:", error);
        }
      );
    }
  }
}