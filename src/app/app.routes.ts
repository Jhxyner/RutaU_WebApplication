import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register) },
  { path: '**', redirectTo: 'login' },
];
