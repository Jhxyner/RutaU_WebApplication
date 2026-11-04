import { Routes } from '@angular/router';
import { History } from './history/history';
import { Notifications } from './notifications/notifications';

export const SHARED_ROUTES: Routes = [
  { path: 'historial', component: History },
  { path: 'notificaciones', component: Notifications },
];