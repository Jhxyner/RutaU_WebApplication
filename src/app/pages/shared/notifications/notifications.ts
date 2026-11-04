import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { AppNotification, NotificationType } from '../../../core/model/notification.model';
import { NotificationService } from '../../../core/services/notification.service';
import { relTime } from '../../../core/util';
import { TPipe } from '../../../core/i18n';

/** Por tipo: ícono, color y título (la API solo envía el mensaje). */
const KIND: Record<NotificationType, { icon: string; tone: string; title: string }> = {
  REQUEST_RECEIVED: { icon: 'bookmark_border', tone: 'warn', title: 'Nueva solicitud en tu viaje' },
  REQUEST_ACCEPTED: { icon: 'check', tone: 'ok', title: 'Tu solicitud fue aceptada' },
  REQUEST_REJECTED: { icon: 'close', tone: 'err', title: 'Solicitud rechazada' },
  REQUEST_CANCELLED: { icon: 'event_busy', tone: 'orange', title: 'Solicitud cancelada' },
  TRIP_CANCELLED: { icon: 'flag', tone: 'orange', title: 'Viaje cancelado' },
  ACCOUNT_WARNING: { icon: 'warning_amber', tone: 'warn', title: 'Advertencia en tu cuenta' },
  ACCOUNT_SUSPENDED: { icon: 'block', tone: 'err', title: 'Cuenta suspendida' },
};

/** A qué pantalla lleva cada tipo de notificación (las de cuenta no tienen destino). */
const TARGET: Partial<Record<NotificationType, string>> = {
  REQUEST_RECEIVED: '/conductor/viajes',
  REQUEST_CANCELLED: '/conductor/viajes',
  REQUEST_ACCEPTED: '/pasajero/solicitudes',
  REQUEST_REJECTED: '/pasajero/solicitudes',
  TRIP_CANCELLED: '/pasajero/solicitudes',
};

type Tab = 'all' | 'unread';

@Component({
  selector: 'app-notifications',
  imports: [TPipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  private readonly service = inject(NotificationService);
  private readonly router = inject(Router);

  readonly items = signal<AppNotification[]>([]);
  readonly tab = signal<Tab>('all');

  readonly unread = computed(() => this.items().filter((n) => !n.read));
  readonly shown = computed(() => (this.tab() === 'unread' ? this.unread() : this.items()));

  protected readonly relTime = relTime;

  constructor() {
    this.service.findMine().subscribe((n) => this.items.set(n));
  }

  kind(t: NotificationType) {
    return KIND[t] ?? { icon: 'info', tone: 'info', title: 'Notificación' };
  }

  target(t: NotificationType) {
    return TARGET[t] ?? null;
  }

  /** Marca como leída (si hace falta) y lleva a la pantalla correspondiente. */
  open(n: AppNotification) {
    const go = () => {
      const to = this.target(n.type);
      if (to) this.router.navigateByUrl(to);
    };
    if (n.read) {
      go();
      return;
    }
    this.service.markAsRead(n.id).subscribe({
      next: (u) => {
        this.items.update((l) => l.map((x) => (x.id === u.id ? u : x)));
        this.service.refreshUnread();
        go();
      },
      error: go,
    });
  }

  /** La API marca de una en una, así que se envían todas juntas y se espera a que terminen. */
  readAll() {
    const pending = this.unread();
    if (pending.length === 0) return;
    forkJoin(pending.map((n) => this.service.markAsRead(n.id))).subscribe((updated) => {
      this.items.update((l) => l.map((x) => updated.find((u) => u.id === x.id) ?? x));
      this.service.refreshUnread();
    });
  }
}