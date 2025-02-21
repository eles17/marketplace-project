import { Component, OnInit } from '@angular/core';
import { ListingsService } from '../../core/services/listings.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-listings', 
  standalone: false,
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss'
})
export class ListingsComponent implements OnInit {
  listings: any[] = []; // Store listings data
  userId: number | null = null; // Store logged-in user ID

  constructor(private listingsService: ListingsService, private router: Router, private authService: AuthService) {} // Ensure correct service

  ngOnInit(): void {
    this.userId = this.authService.getUserId(); // Get logged-in user ID
    this.fetchListings();
  }

  fetchListings(): void {
    this.listingsService.getListings().subscribe({
      next: (data: any[]) => { 
        this.listings = data;
      },
      error: (err: any) => {  
        console.error('Error fetching listings:', err);
      }
    });
  }

  goToAddListing() {
    this.router.navigate(['/listings/add-listing']);
  }

  editListing(id: number): void {
    this.router.navigate(['/listings/edit', id]); // Navigate to edit page
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