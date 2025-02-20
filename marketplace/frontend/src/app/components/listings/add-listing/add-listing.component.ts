import { Component } from '@angular/core';
import { ListingsService } from '../../../core/services/listings.service';

@Component({
  selector: 'app-add-listing',
  standalone: false,
  templateUrl: './add-listing.component.html',
  styleUrls: ['./add-listing.component.scss']
})
export class AddListingComponent {
  listing: { title: string; description: string; price: number | null; category: string; image: File | null } = {
    title: '',
    description: '',
    price: null,
    category: '',
    image: null
  };

  categories = ['Real Estate', 'Retail', 'Vehicles'];

  constructor(private listingsService: ListingsService) {}

  onFileSelected(event: any) {
    this.listing.image = event.target.files[0];
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('title', this.listing.title);
    formData.append('description', this.listing.description);
    formData.append('price', this.listing.price ? this.listing.price.toString() : '');
    formData.append('category', this.listing.category);
    if (this.listing.image) {
      formData.append('image', this.listing.image);
    }

    this.listingsService.createListing(formData).subscribe(
      (response) => {
        console.log('Listing created:', response);
        alert('Listing created successfully!');
      },
      (error) => {
        console.error('Error creating listing:', error);
        alert('Failed to create listing.');
      }
    );
  }
}