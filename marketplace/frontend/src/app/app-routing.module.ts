import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListingsComponent } from './components/listings/listings.component';
import { ListingDetailsComponent } from './components/listings/listing-details/listing-details.component';
import { AddListingComponent } from './components/listings/add-listing/add-listing.component';
import { EditListingComponent } from './components/listings/edit-listing/edit-listing.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';

 

const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AdminGuard] }, 
  { path: 'dashboard', component: DashboardComponent },
  { path: 'listings', component: ListingsComponent},
  { path: 'listings/:id', component: ListingDetailsComponent, pathMatch: 'full' },
{ path: 'listings/add-listing', component: AddListingComponent },
{ path: 'listings/edit/:id', component: EditListingComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }, // redirects to login
  { path: '**', redirectTo: '/auth/login' }  // Handles unknown routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}