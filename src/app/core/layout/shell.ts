import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { interval } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { NotificationService } from '../services/notification.service';
import { initials } from '../util';
import { TPipe } from '../i18n';

interface NavLink { path: string; label: string; icon: string; }

const USER_LINKS: NavLink[] = [
  { path: '/pasajero/viajes', label: 'Buscar viajes', icon: 'search' },
  { path: '/pasajero/solicitudes', label: 'Mis solicitudes', icon: 'bookmark_border' },
  { path: '/conductor/publicar', label: 'Publicar viaje', icon: 'add' },
  { path: '/conductor/viajes', label: 'Mis viajes', icon: 'directions_car' },
  { path: '/conductor/vehiculo', label: 'Mi vehículo', icon: 'vpn_key' },
  { path: '/cuenta/historial', label: 'Historial', icon: 'history' },
  { path: '/cuenta/notificaciones', label: 'Notificaciones', icon: 'notifications_none' },
];

const ADMIN_LINKS: NavLink[] = [
  { path: '/admin/reportes', label: 'Reportes de demanda', icon: 'bar_chart' },
  { path: '/admin/moderacion', label: 'Moderación', icon: 'gavel' },
];

/** Estructura de las pantallas con sesión: encabezado, menú lateral según el rol, contenido y pie. */
@Component({
  selector: 'app-shell',
  imports: [TPipe, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly lang = inject(LanguageService);
  protected readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);
  protected readonly links = computed(() => (this.auth.isAdmin() ? ADMIN_LINKS : USER_LINKS));
  protected readonly ini = computed(() => initials(this.auth.user()?.fullName));
  protected readonly roleLabel = computed(() => (this.auth.isAdmin() ? 'Moderador' : 'Conductor y pasajero'));

  constructor() {
    if (this.auth.isUser()) {
      this.notifications.refreshUnread();
      interval(60_000).pipe(takeUntilDestroyed()).subscribe(() => this.notifications.refreshUnread());
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}