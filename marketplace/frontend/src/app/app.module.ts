import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module'; 
import { AppComponent } from './app.component';
import { ApiService } from './core/services/api.service';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListingsComponent } from './components/listings/listings.component';
import { ListingDetailsComponent } from './components/listings/listing-details/listing-details.component';
import { AddListingComponent } from './components/listings/add-listing/add-listing.component';
import { EditListingComponent } from './components/listings/edit-listing/edit-listing.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';

@NgModule({
  declarations: [
    AppComponent, 
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    ListingsComponent,
    ListingDetailsComponent,
    AddListingComponent,
    EditListingComponent,
    AdminPanelComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [ApiService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule {}