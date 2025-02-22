import { Component, OnInit } from '@angular/core';
import { ListingsService } from '../../../core/services/listings.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-listing',
  standalone: false,
  templateUrl: './add-listing.component.html',
  styleUrls: ['./add-listing.component.scss']
})
export class AddListingComponent implements OnInit {
  listing = {
    title: '',
    description: '',
    price: null as number | null, // Ensure price can be null
    category: null as number | null // Ensure category is treated as a number
  };

  categories: { id: number; name: string; subcategories: { id: number; name: string }[] }[] = [];
  subcategories: { id: number; name: string }[] = [];
  selectedMainCategory: number | null = null;
  selectedFile: File | null = null;
  errorMessage: string = ''; // Store error messages

  constructor(private listingsService: ListingsService, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.http.get<{ id: number; name: string; subcategories: { id: number; name: string }[] }[]>(
      `${environment.apiUrl}/marketplace/categories`
    ).subscribe({
      next: (data) => {
        this.categories = data.filter(cat => cat.subcategories && cat.subcategories.length > 0); // Ensure only main categories are shown
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.errorMessage = "Failed to load categories.";
      }
    });
  }

  updateSubcategories(): void {
    if (this.selectedMainCategory) {
      const selectedCategory = this.categories.find(cat => cat.id === this.selectedMainCategory);
      this.subcategories = selectedCategory?.subcategories || [];
    } else {
      this.subcategories = [];
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']; // Restrict file types
      if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Please select a JPG or PNG image.");
        return;
      }
      this.selectedFile = file;
    }
  }

  createListing(): void {
    if (!this.isValidListing()) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = this.prepareFormData();
    const type = this.getListingType();

    this.listingsService.createListing(formData, type).subscribe({
      next: () => {
        alert("Listing successfully created!");
        this.router.navigate(['/listings']);
      },
      error: (err) => {
        console.error("Error creating listing:", err);
        alert("Error creating listing.");
      }
    });
  }

  resetForm(): void {
    this.listing = { title: '', description: '', price: null, category: null };
    this.selectedFile = null;
    this.selectedMainCategory = null;
    this.subcategories = [];
  }

  isValidListing(): boolean {
    return !!(this.listing.title && this.listing.description && 
              this.listing.price && !isNaN(this.listing.price) &&
              this.selectedMainCategory);
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    formData.append("title", this.listing.title);
    formData.append("description", this.listing.description);
    formData.append("price", this.listing.price!.toString());
    formData.append("category", this.selectedMainCategory!.toString());

    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    return formData;
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
}