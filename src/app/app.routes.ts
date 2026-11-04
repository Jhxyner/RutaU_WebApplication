import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';
import { Shell } from './core/layout/shell';
import { AuthService } from './core/services/auth.service';
import { AUTH_ROUTES } from './pages/auth/auth.routes';

export const routes: Routes = [
  ...AUTH_ROUTES,
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'pasajero', loadChildren: () => import('./pages/passenger/passenger.routes').then((m) => m.PASSENGER_ROUTES) },
      { path: 'conductor', loadChildren: () => import('./pages/driver/driver.routes').then((m) => m.DRIVER_ROUTES) },
      { path: 'cuenta', loadChildren: () => import('./pages/shared/shared.routes').then((m) => m.SHARED_ROUTES) },
      { path: 'admin', canActivate: [adminGuard], loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
      { path: '', pathMatch: 'full', redirectTo: () => (inject(AuthService).isAdmin() ? 'admin/reportes' : 'pasajero/viajes') },
    ],
  },
  { path: '**', redirectTo: '' },
];