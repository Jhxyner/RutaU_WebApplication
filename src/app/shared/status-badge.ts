import { Component, computed, input } from '@angular/core';
import { tr } from '../core/i18n';

/** estado de la API -> [texto visible, tono]. Nunca solo color: siempre lleva texto. */
const MAP: Record<string, [string, string]> = {
  SCHEDULED: ['Programado', 'ok'],
  FULL: ['Completo', 'info'],
  COMPLETED: ['Completado', 'info'],
  CANCELLED: ['Cancelado', 'muted'],
  PENDING: ['Pendiente', 'warn'],
  ACCEPTED: ['Aceptada', 'ok'],
  REJECTED: ['Rechazada', 'err'],
  RESOLVED: ['Resuelto', 'ok'],
  DISMISSED: ['Descartado', 'muted'],
  NO_REQUESTS: ['Sin solicitudes', 'muted'],
};

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="'badge ' + tone()">{{ label() }}</span>`,
  styles: `
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .ok { background: var(--success-soft); color: var(--success); }
    .info { background: var(--primary-soft); color: var(--primary); }
    .warn { background: var(--warning-soft); color: var(--warning); }
    .err { background: var(--error-soft); color: var(--error); }
    .muted { background: #E8EDEF; color: var(--muted); }
  `,
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly label = computed(() => tr(MAP[this.status()]?.[0] ?? this.status()));
  readonly tone = computed(() => MAP[this.status()]?.[1] ?? 'muted');
}