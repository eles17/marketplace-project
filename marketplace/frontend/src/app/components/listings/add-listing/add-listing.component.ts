import { Component, OnInit } from '@angular/core';
import { ListingsService } from '../../../core/services/listings.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
    price: null as number | null, // Ensuring null is handled correctly
    category: null as number | null, // Ensure category is treated as a number
  };
  
  categories: { id: number; name: string }[] = []; // Correctly define categories
  selectedFile: File | null = null;
  errorMessage: string = ''; // Store any errors

  constructor(private listingsService: ListingsService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/marketplace/categories`).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.categories = data; // Assign data only if it's valid
        } else {
          this.errorMessage = "No categories found.";
        }
      },
      (error) => {
        console.error('Error fetching categories:', error);
        this.errorMessage = "Failed to load categories.";
      }
    );
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
    // Validate all required fields
    if (!this.listing.title || !this.listing.description || !this.listing.price || !this.listing.category) {
      alert('All fields are required');
      return;
    }

    // Ensure price is converted correctly
    const formData = new FormData();
    formData.append('title', this.listing.title);
    formData.append('description', this.listing.description);
    formData.append('price', this.listing.price?.toString() || '0'); // Prevent null price error
    formData.append('category', this.listing.category?.toString() || ''); // Ensure category is sent correctly

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.listingsService.createListing(formData).subscribe(
      (response) => {
        console.log('Listing created successfully:', response);
        alert("Listing successfully created!"); // User feedback
      },
      (error) => {
        console.error('Error creating listing:', error);
        alert("Error creating listing.");
      }
    );
  }
}