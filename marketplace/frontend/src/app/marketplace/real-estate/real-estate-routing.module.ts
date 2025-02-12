import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RealEstateListComponent } from './real-estate-list/listings.component';
import { RealEstateDetailComponent } from './real-estate-detail/details.component';

const routes: Routes = [
    { path: '', component: RealEstateListComponent}, //Default listing view
    { path: ':id', component: RealEstateDetailComponent } // Product details view
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealEstateRoutingModule { }
