import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiclesListComponent} from './vehicles-list/listings.component'
import { VehicleDetailComponent} from './vehicles-detail/details.component'

const routes: Routes = [
  { path: '', component: VehiclesListComponent}, //Default listing view
  { path: ':id', component: VehicleDetailComponent } // Product details view
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }
