import { Component, OnInit } from '@angular/core';
import { ListingsService } from '../../core/services/listings.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-listings', 
  standalone: false,
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss'
})
export class ListingsComponent implements OnInit {
  listings: any[] = []; // Store listings data

  constructor(private listingsService: ListingsService, private router: Router) {} // Ensure correct service

  ngOnInit(): void {
    this.fetchListings(); // Call the function to load listings
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
}