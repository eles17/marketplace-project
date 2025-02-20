import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListingsComponent } from './components/listings/listings.component';
import { ListingDetailsComponent } from './components/listings/listing-details/listing-details.component';
import { AddListingComponent } from './components/listings/add-listing/add-listing.component';

const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'listings', component: ListingsComponent},
  { path: 'listings/add-listing', component: AddListingComponent},
  { path: 'listings/:id', component: ListingDetailsComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }, // redirects to login
  { path: '**', redirectTo: '/auth/login' }  // Handles unknown routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}