import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'viajes' },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register) },
  {
    path: 'viajes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/passenger/browse/browse').then((m) => m.Browse),
  },
  {
    path: 'conductor/publicar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/driver/publish-trip/publish-trip').then((m) => m.PublishTrip),
  },
  {
    path: 'conductor/vehiculo',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/driver/my-vehicle/my-vehicle').then((m) => m.MyVehicle),
  },
  { path: '**', redirectTo: 'viajes' },
];
