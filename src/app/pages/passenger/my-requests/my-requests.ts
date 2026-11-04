import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SeatRequest } from '../../../core/model/seat-request.model';
import { SeatRequestService } from '../../../core/services/seat-request.service';
import { fmtDate, fmtTime, initials } from '../../../core/util';
import { CancelDialog } from '../../../shared/cancel-dialog';
import { StatusBadge } from '../../../shared/status-badge';
import { TPipe, tr } from '../../../core/i18n';

type Filter = 'all' | 'pending' | 'accepted' | 'closed';

@Component({
  selector: 'app-my-requests',
  imports: [TPipe, MatCardModule, MatButtonModule, StatusBadge],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequests {
  private readonly service = inject(SeatRequestService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly items = signal<SeatRequest[]>([]);
  readonly filter = signal<Filter>('all');

  readonly pending = computed(() => this.items().filter((r) => r.status === 'PENDING'));
  readonly accepted = computed(() => this.items().filter((r) => r.status === 'ACCEPTED'));
  readonly closed = computed(() => this.items().filter((r) => ['REJECTED', 'CANCELLED', 'COMPLETED'].includes(r.status)));
  readonly shown = computed(() => {
    switch (this.filter()) {
      case 'pending': return this.pending();
      case 'accepted': return this.accepted();
      case 'closed': return this.closed();
      default: return this.items();
    }
  });

  protected readonly fmtDate = fmtDate;
  protected readonly fmtTime = fmtTime;
  protected readonly initials = initials;

  constructor() {
    this.service.findMine().subscribe((r) => this.items.set(r));
  }

  cancel(r: SeatRequest) {
    this.dialog
      .open(CancelDialog, { width: '420px', data: { title: 'Cancelar solicitud', confirmLabel: 'Cancelar solicitud' } })
      .afterClosed()
      .subscribe((reason: string | undefined) => {
        if (!reason) return;
        this.service.cancel(r.id, reason).subscribe({
          next: (u) => {
            this.items.update((l) => l.map((x) => (x.id === u.id ? u : x)));
            this.snack.open(tr('Solicitud cancelada'), tr('Cerrar'), { duration: 2500 });
          },
          error: (e) => this.snack.open(e.error?.message ?? tr('No se pudo cancelar'), tr('Cerrar'), { duration: 4000 }),
        });
      });
  }

  view(r: SeatRequest) {
    this.router.navigate(['/pasajero/viajes', r.tripId]);
  }
}