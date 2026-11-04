import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../model/notification.model';

@Service()
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/notifications`;

  /** Cantidad de no leídas, para la campana del encabezado. */
  readonly unread = signal(0);

  findMine() {
    return this.http.get<AppNotification[]>(`${this.api}/me`);
  }

  refreshUnread() {
    this.http.get<Record<string, number>>(`${this.api}/me/unread-count`).subscribe({
      next: (r) => this.unread.set(Object.values(r)[0] ?? 0),
      error: () => this.unread.set(0),
    });
  }

  markAsRead(id: number) {
    return this.http.patch<AppNotification>(`${this.api}/${id}/read`, {});
  }
}