import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TripService } from '../../../core/services/trip.service';
import { Trip } from '../../../core/model/trip.model';

@Component({
  selector: 'app-publish-trip',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './publish-trip.html',
  styleUrl: './publish-trip.css',
})
export class PublishTrip {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TripService);
  private readonly snack = inject(MatSnackBar);

  readonly trips = signal<Trip[]>([]);

  readonly form = this.fb.nonNullable.group({
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    zone: ['', Validators.required],
    departureTime: ['', Validators.required],
    seats: [1, [Validators.required, Validators.min(0)]],
    pricePerSeat: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() { this.load(); }

  private load() { this.service.findMine().subscribe((t) => this.trips.set(t)); }

  save() {
    if (this.form.invalid) return;
    this.service.create(this.form.getRawValue()).subscribe({
      next: () => { this.form.reset(); this.load(); this.snack.open('Viaje publicado', 'Cerrar', { duration: 2000 }); },
      error: (e) => this.snack.open(e.error?.message ?? 'Error', 'Cerrar', { duration: 4000 }),
    });
  }

  remove(t: Trip) {
    this.service.cancel(t.id, 'Cancelado por el conductor').subscribe({
      next: () => this.trips.update((l) => l.filter((x) => x.id !== t.id)),
      error: (e) => this.snack.open(e.error?.message ?? 'Error', 'Cerrar', { duration: 4000 }),
    });
  }
}