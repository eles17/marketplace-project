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
  selectedFile: File | null = null;

  newListing: { title: string; description: string; price: number | null } = {
    title: '',
    description: '',
    price: null
  };

  constructor(private listingsService: ListingsService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadCategories();
    this.fetchListings();
  }

  loadCategories(): void {
    this.listingsService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categories = data;
      },
      error: (err: any) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  createListing(): void {
    if (!this.newListing.title || !this.newListing.description || !this.newListing.price || !this.selectedMainCategory) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", this.newListing.title);
    formData.append("description", this.newListing.description);
    formData.append("price", this.newListing.price.toString());
    formData.append("category", this.selectedMainCategory.toString());
    if (this.selectedSubCategory) {
      formData.append("subcategory", this.selectedSubCategory.toString());
    }
    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    const type = this.getListingType();
    this.listingsService.createListing(formData, type).subscribe({
      next: () => {
        alert("Listing created successfully!");
        this.router.navigate(['/listings']);
      },
      error: (err) => {
        console.error("Error creating listing:", err);
        alert("Error creating listing.");
      }
    });
  }

  getListingType(): string {
    switch (this.selectedMainCategory) {
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

  fetchListings(): void {
    this.listingsService.getAllPublicListings().subscribe({
      next: (data) => { this.listings = data; },
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
    this.router.navigateByUrl('/listings/add-listing');
  }

  editListing(id: number): void {
    this.router.navigate([`/listings/edit/${id}`]);
  }

  onMainCategoryChange(): void {
    if (!this.selectedMainCategory) {
      this.subcategories = [];
      this.selectedSubCategory = null;
      return;
    }
  
    const selectedCategory = this.categories.find(cat => cat.id == this.selectedMainCategory);
    this.subcategories = selectedCategory ? selectedCategory.subcategories : [];
    this.selectedSubCategory = null;
  }
  
  deleteListing(id: number, type: string): void {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      this.listingsService.deleteListing(id, type).subscribe({
        next: () => {
          alert(`${type} deleted successfully!`);
          this.fetchListings();
        },
        error: (err) => {
          console.error(`Error deleting ${type}:`, err);
          alert(`Error deleting ${type}.`);
        }
      });
    }
  }
}