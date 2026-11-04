import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { SeatRequest } from '../../../core/model/seat-request.model';
import { Trip } from '../../../core/model/trip.model';
import { SeatRequestService } from '../../../core/services/seat-request.service';
import { TripService } from '../../../core/services/trip.service';
import { fmtDate, fmtTime, initials } from '../../../core/util';
import { CancelDialog } from '../../../shared/cancel-dialog';
import { StatusBadge } from '../../../shared/status-badge';
import { CompleteDialog } from './complete-dialog';
import { TPipe, tr } from '../../../core/i18n';

type Role = 'driver' | 'passenger';

@Component({
  selector: 'app-my-trips',
  imports: [TPipe, DecimalPipe, MatCardModule, MatButtonModule, StatusBadge],
  templateUrl: './my-trips.html',
  styleUrl: './my-trips.css',
})
export class MyTrips {
  private readonly tripsApi = inject(TripService);
  private readonly requestsApi = inject(SeatRequestService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly role = signal<Role>('driver');
  readonly trips = signal<Trip[]>([]);
  /** Solicitudes por viaje activo (tripId → solicitudes). */
  readonly requests = signal<Record<number, SeatRequest[]>>({});
  /** Viajes donde participo como pasajero (solicitudes aceptadas/completadas). */
  readonly asPassenger = signal<SeatRequest[]>([]);

  readonly active = computed(() => this.trips().filter((t) => t.status === 'SCHEDULED' || t.status === 'FULL'));
  readonly closed = computed(() =>
    this.trips()
      .filter((t) => t.status === 'COMPLETED' || t.status === 'CANCELLED')
      .sort((a, b) => b.departureTime.localeCompare(a.departureTime)),
  );
  /** Como en el diseño: primero los activos y luego los cerrados, todos en una sola lista. */
  readonly all = computed(() => [...this.active(), ...this.closed()]);

  protected readonly fmtDate = fmtDate;
  protected readonly fmtTime = fmtTime;
  protected readonly initials = initials;

  constructor() {
    this.load();
    this.requestsApi.findMine().subscribe((r) => this.asPassenger.set(r.filter((x) => x.status === 'ACCEPTED' || x.status === 'COMPLETED')));
  }

  load() {
    this.tripsApi.findMine().subscribe((list) => {
      this.trips.set(list);
      const active = list.filter((t) => t.status === 'SCHEDULED' || t.status === 'FULL');
      if (active.length === 0) {
        this.requests.set({});
        return;
      }
      // Una sola espera para traer las solicitudes de todos los viajes activos.
      forkJoin(active.map((t) => this.requestsApi.findByTrip(t.id))).subscribe((all) => {
        const map: Record<number, SeatRequest[]> = {};
        active.forEach((t, i) => (map[t.id] = all[i]));
        this.requests.set(map);
      });
    });
  }

  isActive(t: Trip) { return t.status === 'SCHEDULED' || t.status === 'FULL'; }
  seatsTaken(t: Trip) { return t.totalSeats - t.availableSeats; }
  noRequests(t: Trip) { return this.pending(t).length === 0 && this.accepted(t).length === 0; }
  detail(t: Trip) { this.router.navigate(['/pasajero/viajes', t.id]); }

  pending(t: Trip) { return (this.requests()[t.id] ?? []).filter((r) => r.status === 'PENDING'); }
  accepted(t: Trip) { return (this.requests()[t.id] ?? []).filter((r) => r.status === 'ACCEPTED'); }

  accept(r: SeatRequest) { this.decide(this.requestsApi.accept(r.id), 'Solicitud aceptada'); }
  reject(r: SeatRequest) { this.decide(this.requestsApi.reject(r.id), 'Solicitud rechazada'); }

  private decide(call: ReturnType<SeatRequestService['accept']>, ok: string) {
    call.subscribe({
      next: () => {
        this.snack.open(tr(ok), tr('Cerrar'), { duration: 2500 });
        this.load();
      },
      error: (e) => this.snack.open(e.error?.message ?? tr('No se pudo completar la acción'), tr('Cerrar'), { duration: 4000 }),
    });
  }

  cancel(t: Trip) {
    this.dialog
      .open(CancelDialog, { width: '420px', data: { title: 'Cancelar viaje', confirmLabel: 'Cancelar viaje' } })
      .afterClosed()
      .subscribe((reason: string | undefined) => {
        if (!reason) return;
        this.tripsApi.cancel(t.id, reason).subscribe({
          next: () => {
            this.snack.open(tr('Viaje cancelado'), tr('Cerrar'), { duration: 2500 });
            this.load();
          },
          error: (e) => this.snack.open(e.error?.message ?? tr('No se pudo cancelar'), tr('Cerrar'), { duration: 4000 }),
        });
      });
  }

  complete(t: Trip) {
    const early = new Date(t.departureTime).getTime() > Date.now();
    this.dialog
      .open(CompleteDialog, { width: '460px', data: { passengers: this.accepted(t), early } })
      .afterClosed()
      .subscribe((body) => {
        if (!body) return;
        this.tripsApi.complete(t.id, body).subscribe({
          next: (r) => {
            this.snack.open(r.message || tr('Viaje finalizado'), tr('Cerrar'), { duration: 3000 });
            this.load();
          },
          error: (e) => this.snack.open(e.error?.message ?? tr('No se pudo finalizar'), tr('Cerrar'), { duration: 4000 }),
        });
      });
  }
}