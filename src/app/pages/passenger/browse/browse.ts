import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TripService } from '../../../core/services/trip.service';
import { SeatRequestService } from '../../../core/services/seat-request.service';
import { Trip, TripStop } from '../../../core/model/trip.model';

/** Paginador en español. */
function paginatorEs(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Por página';
  intl.nextPageLabel = 'Siguiente';
  intl.previousPageLabel = 'Anterior';
  intl.getRangeLabel = (page, size, length) => {
    if (length === 0) return '0 de 0';
    const start = page * size + 1;
    const end = Math.min(start + size - 1, length);
    return `${start}–${end} de ${length}`;
  };
  return intl;
}

@Component({
  selector: 'app-browse',
  imports: [FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useFactory: paginatorEs }],
  templateUrl: './browse.html',
  styleUrl: './browse.css',
})
export class Browse {
  private readonly trips = inject(TripService);
  private readonly requests = inject(SeatRequestService);
  private readonly snack = inject(MatSnackBar);
  private readonly search$ = new Subject<string>();

  readonly list = signal<Trip[]>([]);
  readonly total = computed(() => this.list().length);
  readonly paged = computed(() =>
    this.list().slice(this.pageIndex() * this.pageSize, (this.pageIndex() + 1) * this.pageSize),
  );
  readonly pageIndex = signal(0);
  readonly pageSize = 12;
  private query = '';

  readonly selected = signal<Trip | null>(null);
  readonly stops = computed(() => this.selected()?.stops ?? []);
  readonly activeStop = signal<number | null>(null);
  maxPrice: number | null = null;

  /** El viaje seleccionado no tiene asientos libres. */
  readonly full = computed(() => (this.selected()?.availableSeats ?? 0) === 0);

  constructor() {
    this.load();
    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((q) => {
      this.query = q;
      this.pageIndex.set(0);
      this.load();
    });
  }

  load() {
    this.trips.search(this.query, this.maxPrice).subscribe((r) => this.list.set(r.results));
  }

  onSearch(e: Event) { this.search$.next((e.target as HTMLInputElement).value.trim()); }
  onPage(e: PageEvent) { this.pageIndex.set(e.pageIndex); }
  applyFilters() { this.pageIndex.set(0); this.load(); }

  open(t: Trip) {
    this.selected.set(t);
    this.activeStop.set(null);
  }

  pick(s: TripStop) { this.activeStop.set(s.id); }

  fmtDate(d: string) {
    return new Date(d).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  fmtTime(d: string) {
    return new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  book() {
    const t = this.selected();
    if (!t) return;
    this.requests.create({ tripId: t.id, pickupStopId: this.activeStop() }).subscribe({
      next: () => {
        this.snack.open('¡Solicitud enviada!', 'Cerrar', { duration: 2500 });
        this.selected.set(null);
        this.activeStop.set(null);
      },
      error: (e) => this.snack.open(e.error?.message ?? 'No se pudo solicitar', 'Cerrar', { duration: 4000 }),
    });
  }
}