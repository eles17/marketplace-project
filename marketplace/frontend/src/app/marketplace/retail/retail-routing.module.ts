import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RetailListComponent } from './retail-list/listings.component';
import { RetailDetailComponent } from './retail-detail/details.component';


const routes: Routes = [
  { path: '', component: RetailListComponent}, //Default listing view
  { path: ':id', component: RetailDetailComponent } // Product details view
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RetailRoutingModule { }
