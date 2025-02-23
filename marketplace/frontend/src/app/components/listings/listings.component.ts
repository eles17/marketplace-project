import { Component, OnInit } from '@angular/core';
import { ListingsService } from '../../core/services/listings.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-listings',
  standalone: false,
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss']
})
export class ListingsComponent implements OnInit {
  listings: any[] = []; // Store all listings
  categories: any[] = []; // Store main categories
  subcategories: any[] = []; // Store subcategories dynamically
  userId: number | null = null; // Store logged-in user ID

  selectedMainCategory: number | null = null;
  selectedSubCategory: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  searchQuery: string = '';
  sortOption: string = 'newest';

  constructor(private listingsService: ListingsService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadCategories();
    this.fetchListings();
  }

  loadCategories(): void {
    this.listingsService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categories = data.filter(cat => !cat.sub1_id); // Get only main categories
      },
      error: (err: any) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  updateSubcategories(): void {
    if (!this.selectedMainCategory) {
      this.subcategories = [];
      this.selectedSubCategory = null;
      return;
    }

    const selectedCategory = this.categories.find(cat => cat.id === this.selectedMainCategory);
    this.subcategories = selectedCategory ? selectedCategory.subcategories : [];
  }

  fetchListings(): void {
    this.listingsService.getAllPublicListings().subscribe({
      next: (data) => { 
        this.listings = data; 
      },
      error: (err) => console.error('Error fetching listings:', err)
    });
  }

  applyFilters(): void {
    this.fetchListings();
  }

  resetFilters(): void {
    this.selectedMainCategory = null;
    this.selectedSubCategory = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.searchQuery = '';
    this.sortOption = 'newest';
    this.fetchListings();
  }

  goToAddListing(): void {
    this.router.navigate(['/listings/add-listing']);
  }

  editListing(id: number, mainCategory: string): void {
    this.router.navigate([`/listings/edit/${id}`], { queryParams: { type: mainCategory } });
  }

  deleteListing(id: number, mainCategory: string): void {
    if (confirm(`Are you sure you want to delete this listing?`)) {
      this.listingsService.deleteListing(id, mainCategory).subscribe({
        next: () => {
          alert(`Listing deleted successfully!`);
          this.fetchListings();
        },
        error: (err) => {
          console.error(`Error deleting listing:`, err);
          alert(`Error deleting listing.`);
        }
      });
    }
  }

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