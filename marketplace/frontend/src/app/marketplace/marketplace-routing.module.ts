import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'retail', loadChildren: () => import('./retail/retail.module').then(m => m.RetailModule)},
  { path: 'vehicle', loadChildren: () => import('./vehicles/vehicles.module').then(m => m.VehiclesModule)},
  { path: 'real-estate', loadChildren: () => import('./real-estate/real-estate.module').then(m => m.RealEstateModule)},
  { path: '', redirectTo: '/auth/login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceRoutingModule { }
