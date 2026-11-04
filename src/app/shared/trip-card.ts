import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Trip } from '../core/model/trip.model';
import { fmtDate, fmtTime, initials } from '../core/util';
import { RouteLine } from './route-line';
import { TPipe } from '../core/i18n';

/** Tarjeta de viaje: quién conduce, la ruta, y hora/asientos/precio. */
@Component({
  selector: 'app-trip-card',
  imports: [TPipe, DecimalPipe, MatCardModule, MatButtonModule, RouteLine],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css',
})
export class TripCard {
  readonly trip = input.required<Trip>();
  readonly detail = output<void>();

  readonly ini = computed(() => initials(this.trip().driverName));
  readonly when = computed(() => `${fmtDate(this.trip().departureTime)} ${fmtTime(this.trip().departureTime)}`);
  readonly soldOut = computed(() => this.trip().availableSeats === 0);
}