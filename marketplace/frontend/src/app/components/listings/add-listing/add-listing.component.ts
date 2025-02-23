import { Component, OnInit } from '@angular/core';
import { ListingsService } from '../../../core/services/listings.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-listing',
  standalone: false,
  templateUrl: './add-listing.component.html',
  styleUrls: ['./add-listing.component.scss']
})
export class AddListingComponent implements OnInit {
  listing: any = {
    title: '',
    description: '',
    price: null,
    category_id: null,
    image_url: '',
    model: '',
    vehicle_type: '',
    mileage: null,
    fuel_type: '',
    color: '',
    condition: '',
    type: '',
    address: '',
    rental_period: '',
    price_per_month: null,
    advance_payment: null,
    available: true,
    delivery_option: ''
  };

  categories: any[] = [];
  subcategories: any[] = [];
  selectedMainCategory: number | null = null;
  selectedFile: File | null = null;
  errorMessage: string = '';

  constructor(private listingsService: ListingsService, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
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

  getListingType(): string {
    return this.selectedMainCategory === 1 ? 'products' :
           this.selectedMainCategory === 2 ? 'vehicles' : 'real-estate';
  }
}