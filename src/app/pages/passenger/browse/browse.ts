import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Trip } from '../../../core/model/trip.model';
import { TripService } from '../../../core/services/trip.service';
import { TripCard } from '../../../shared/trip-card';
import { TPipe, currentLang, tr } from '../../../core/i18n';

@Component({
  selector: 'app-browse',
  imports: [TPipe, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatPaginatorModule, TripCard],
  providers: [MatPaginatorIntl],
  templateUrl: './browse.html',
  styleUrl: './browse.css',
})
export class Browse {
  private readonly fb = inject(FormBuilder);
  private readonly trips = inject(TripService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly intl = inject(MatPaginatorIntl);

  readonly results = signal<Trip[]>([]);
  readonly alternatives = signal<Trip[]>([]);
  readonly loading = signal(false);
  readonly onlyFree = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = 6;

  readonly form = this.fb.nonNullable.group({
    origin: [''],
    destination: [''],
    time: [''],
    zone: [''],
    maxPrice: [null as number | null],
  });

  /** Filtro "Con asientos libres" aplicado sobre lo que devolvió la API. */
  readonly filtered = computed(() => (this.onlyFree() ? this.results().filter((t) => t.availableSeats > 0) : this.results()));
  readonly total = computed(() => this.filtered().length);
  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize, (this.pageIndex() + 1) * this.pageSize));

  constructor() {
    // Textos del paginador en el idioma activo
    effect(() => {
      currentLang();
      this.intl.itemsPerPageLabel = tr('Por página');
      this.intl.nextPageLabel = tr('Siguiente');
      this.intl.previousPageLabel = tr('Anterior');
      this.intl.getRangeLabel = (page, size, length) => {
        if (length === 0) return `0 ${tr('de')} 0`;
        const start = page * size + 1;
        return `${start}–${Math.min(start + size - 1, length)} ${tr('de')} ${length}`;
      };
      this.intl.changes.next();
    });
    this.search();
  }

  search() {
    const v = this.form.getRawValue();
    this.loading.set(true);
    this.trips
      .search({
        origin: v.origin.trim(),
        destination: v.destination.trim(),
        from: v.time,
        to: v.time,
        zone: v.zone.trim(),
        maxPrice: v.maxPrice,
      })
      .subscribe({
        next: (r) => {
          this.results.set(r.results);
          this.alternatives.set(r.alternatives ?? []);
          this.pageIndex.set(0);
          this.loading.set(false);
        },
        error: (e) => {
          this.snack.open(e.error?.message ?? tr('No se pudo buscar'), tr('Cerrar'), { duration: 4000 });
          this.loading.set(false);
        },
      });
  }

  toggleFree() {
    this.onlyFree.update((v) => !v);
    this.pageIndex.set(0);
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
  }

  open(t: Trip) {
    this.router.navigate(['/pasajero/viajes', t.id]);
  }
}