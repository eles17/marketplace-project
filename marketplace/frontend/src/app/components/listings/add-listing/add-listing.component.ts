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
    price: null as number | null,
    category: null as number | null
  };

  // Define only the 3 main categories
  mainCategories = [
    { id: 1, name: 'Retail' },
    { id: 2, name: 'Vehicle' },
    { id: 3, name: 'Real Estate' }
  ];
  
  subcategories: { id: number; name: string; main_category_id: number }[] = [];
  selectedMainCategory: number | null = null;
  selectedFile: File | null = null;
  errorMessage: string = '';

  constructor(private listingsService: ListingsService, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadSubcategories(); // Load all subcategories from backend
  }

  loadSubcategories(): void {
    this.http.get<{ id: number; name: string; main_category_id: number }[]>(
      `${environment.apiUrl}/subcategories`
    ).subscribe({
      next: (data) => {
        console.log("Subcategories received:", data);
        this.subcategories = data;
      },
      error: (error) => {
        console.error('Error fetching subcategories:', error);
        this.errorMessage = "Failed to load subcategories.";
      }
    });
  }

  updateSubcategories(): void {
    if (this.selectedMainCategory) {
      // Filter only subcategories belonging to the selected main category
      this.subcategories = this.subcategories.filter(sub => sub.main_category_id === this.selectedMainCategory);
    } else {
      this.subcategories = [];
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
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
              this.selectedMainCategory && this.listing.category);
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    formData.append("title", this.listing.title);
    formData.append("description", this.listing.description);
    formData.append("price", this.listing.price!.toString());
    formData.append("category", this.listing.category!.toString());

    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    return formData;
  }

  getListingType(): string {
    switch (this.selectedMainCategory) {
      case 1:
        return 'retail';
      case 2:
        return 'vehicle';
      case 3:
        return 'real-estate';
      default:
        return 'retail';
    }
  }
}