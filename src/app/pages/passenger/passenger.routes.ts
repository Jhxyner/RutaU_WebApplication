import { Routes } from '@angular/router';
import { Browse } from './browse/browse';
import { MyRequests } from './my-requests/my-requests';
import { TripDetail } from './trip-detail/trip-detail';

export const PASSENGER_ROUTES: Routes = [
  { path: 'viajes', component: Browse },
  { path: 'viajes/:id', component: TripDetail },
  { path: 'solicitudes', component: MyRequests },
];