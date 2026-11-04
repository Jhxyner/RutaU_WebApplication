import { Routes } from '@angular/router';
import { MyTrips } from './my-trips/my-trips';
import { MyVehicle } from './my-vehicle/my-vehicle';
import { PublishTrip } from './publish-trip/publish-trip';

export const DRIVER_ROUTES: Routes = [
  { path: 'publicar', component: PublishTrip },
  { path: 'viajes', component: MyTrips },
  { path: 'vehiculo', component: MyVehicle },
];