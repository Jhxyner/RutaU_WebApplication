import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, startWith } from 'rxjs';
import { TripStopBody } from '../../../core/model/trip.model';
import { ScheduleComparison } from '../../../core/model/stats.model';
import { Vehicle } from '../../../core/model/vehicle.model';
import { StatsService } from '../../../core/services/stats.service';
import { TripService } from '../../../core/services/trip.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { toIsoLocal } from '../../../core/util';
import { TPipe, tr } from '../../../core/i18n';

@Component({
  selector: 'app-publish-trip',
  imports: [TPipe, DecimalPipe, ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './publish-trip.html',
  styleUrl: './publish-trip.css',
})
export class PublishTrip {
  private readonly fb = inject(FormBuilder);
  private readonly trips = inject(TripService);
  private readonly vehicles = inject(VehicleService);
  private readonly stats = inject(StatsService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly vehicle = signal<Vehicle | null>(null);
  readonly vehicleChecked = signal(false);
  readonly comparison = signal<ScheduleComparison | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    origin: ['', [Validators.required, Validators.maxLength(150)]],
    destination: ['', [Validators.required, Validators.maxLength(150)]],
    zone: ['', [Validators.required, Validators.maxLength(100)]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    seats: [3, [Validators.required, Validators.min(1)]],
    pricePerSeat: [5, [Validators.required, Validators.min(0)]],
    stops: this.fb.nonNullable.array<FormGroup>([]),
  });

  /** Vista previa (resumen lateral): se actualiza con cada cambio del formulario. */
  readonly draft = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue()), map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });
  readonly maxSeats = computed(() => this.vehicle()?.capacity ?? 8);
  readonly maxHourDemand = computed(() => Math.max(1, ...(this.comparison()?.slots ?? []).map((s) => Math.max(s.seatRequests, s.seatsOffered))));
  readonly today = new Date().toISOString().slice(0, 10);

  constructor() {
    this.vehicles.findMine().subscribe({
      next: (v) => {
        this.vehicle.set(v);
        this.form.controls.seats.setValidators([Validators.required, Validators.min(1), Validators.max(v.capacity)]);
        this.form.controls.seats.setValue(Math.min(3, v.capacity));
        this.vehicleChecked.set(true);
      },
      error: () => this.vehicleChecked.set(true),
    });

    // Panel "Demanda por horario": se recarga cuando el usuario escribe la zona.
    this.loadStats('');
    this.form.controls.zone.valueChanges.pipe(takeUntilDestroyed()).subscribe((z) => {
      if (z.trim().length >= 3 || z.trim() === '') this.loadStats(z.trim());
    });
  }

  private newStop() {
    return this.fb.nonNullable.group({
      address: ['', [Validators.required, Validators.maxLength(150)]],
      zone: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  get stops() {
    return this.form.controls.stops;
  }

  addStop() {
    this.form.controls.stops.push(this.newStop());
  }

  removeStop(i: number) {
    this.form.controls.stops.removeAt(i);
  }

  private loadStats(zone: string) {
    this.stats.scheduleComparison(zone).subscribe({ next: (c) => this.comparison.set(c), error: () => this.comparison.set(null) });
  }

  pct(n: number) {
    return Math.round((n / this.maxHourDemand()) * 100);
  }

  publish() {
    if (this.form.invalid || !this.vehicle()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.trips
      .create({
        origin: v.origin.trim(),
        destination: v.destination.trim(),
        zone: v.zone.trim(),
        departureTime: toIsoLocal(v.date, v.time),
        seats: v.seats,
        pricePerSeat: v.pricePerSeat,
        stops: v.stops as TripStopBody[],
      })
      .subscribe({
        next: () => {
          this.snack.open(tr('Viaje publicado'), tr('Cerrar'), { duration: 3000 });
          this.router.navigate(['/conductor/viajes']);
        },
        error: (e) => {
          this.saving.set(false);
          this.snack.open(e.error?.message ?? tr('No se pudo publicar'), tr('Cerrar'), { duration: 4000 });
        },
      });
  }
}