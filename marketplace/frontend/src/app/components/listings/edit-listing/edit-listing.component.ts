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
  listing: any = {};
  categories: any[] = [];
  subcategories: any[] = [];
  selectedMainCategory: number | null = null;
  selectedFile: File | null = null;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingsService: ListingsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const listingId = Number(this.route.snapshot.paramMap.get('id'));

    if (!listingId) {
      this.errorMessage = 'Invalid listing ID.';
      return;
    }

    this.loadCategories();
    this.loadListing(listingId);
  }

  loadCategories(): void {
    this.listingsService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categories = data.filter(cat => !cat.sub1_id);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.errorMessage = "Failed to load categories.";
      }
    });
  }

  loadListing(listingId: number): void {
    this.listingsService.getListingById(listingId).subscribe({
      next: (data) => {
        this.listing = data;
        this.selectedMainCategory = this.getMainCategory(data.category_id);
        this.updateSubcategories();
      },
      error: (err) => {
        console.error("Error fetching listing details:", err);
        this.errorMessage = 'Error fetching listing details.';
      }
    });
  }

  updateSubcategories(): void {
    if (this.selectedMainCategory) {
      const selectedCategory = this.categories.find(cat => cat.id === this.selectedMainCategory);
      this.subcategories = selectedCategory ? selectedCategory.subcategories : [];
    } else {
      this.subcategories = [];
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
    }
  }

  updateListing(): void {
    if (!this.isValidListing()) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = this.prepareFormData();
    this.listingsService.updateListing(this.listing.id, formData).subscribe({
      next: () => {
        alert("Listing updated successfully!");
        this.router.navigate(['/listings']);
      },
      error: (err) => {
        console.error("Error updating listing:", err);
        alert("Error updating listing.");
      }
    });
  }

  isValidListing(): boolean {
    return !!(this.listing.title && this.listing.description &&
              this.listing.price && this.selectedMainCategory && this.listing.category_id);
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    for (const key in this.listing) {
      if (this.listing[key] !== null) {
        formData.append(key, this.listing[key].toString());
      }
    }

    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    return formData;
  }

  getMainCategory(categoryId: number): number | null {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.sub1_id || category.id : null;
  }
}