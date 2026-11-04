import { Routes } from '@angular/router';
import { Moderation } from './moderation/moderation';
import { Reports } from './reports/reports';

export const ADMIN_ROUTES: Routes = [
  { path: 'reportes', component: Reports },
  { path: 'moderacion', component: Moderation },
];