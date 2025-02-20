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
  
  categories: { id: number; name: string; subcategories: { id: number; name: string }[] }[] = [];
  subcategories: { id: number; name: string }[] = [];
  selectedMainCategory: number | null = null;
  selectedFile: File | null = null;
  errorMessage: string = ''; // Store any errors

  constructor(private listingsService: ListingsService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.http.get<{ id: number; name: string; subcategories: { id: number; name: string }[] }[]>(
      `${environment.apiUrl}/marketplace/categories`
    ).subscribe(
      (data) => {
        this.categories = data.filter(cat => cat.subcategories && cat.subcategories.length > 0); // Ensure only main categories are shown
      },
      (error) => {
        console.error('Error fetching categories:', error);
        this.errorMessage = "Failed to load categories.";
      }
    );
  }

  updateSubcategories(): void {
    console.log("Selected Main Category ID:", this.selectedMainCategory);
  
    if (this.selectedMainCategory) {
      const selectedCategory = this.categories.find(cat => cat.id === Number(this.selectedMainCategory));
  
      if (selectedCategory?.subcategories?.length) {
        this.subcategories = selectedCategory.subcategories;
        console.log("Loaded Subcategories:", this.subcategories);
      } else {
        this.subcategories = [];
        console.log("No subcategories found.");
      }
    } else {
      this.subcategories = [];
      console.log("Main category not selected.");
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
    if (!this.listing.title || !this.listing.description || !this.listing.price || !this.listing.category) {
      alert('All fields are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.listing.title);
    formData.append('description', this.listing.description);
    formData.append('price', this.listing.price?.toString() || '0');
    formData.append('category', this.listing.category?.toString() || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.listingsService.createListing(formData).subscribe(
      (response) => {
        console.log('Listing created successfully:', response);
        alert("Listing successfully created!");
        this.resetForm();
      },
      (error) => {
        console.error('Error creating listing:', error);
        alert("Error creating listing.");
      }
    );
  }

  resetForm(): void {
    this.listing = { title: '', description: '', price: null, category: null };
    this.selectedFile = null;
    this.selectedMainCategory = null;
    this.subcategories = [];
  }
}