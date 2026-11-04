import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TripHistoryItem } from '../../../core/model/history.model';
import { RatingService } from '../../../core/services/rating.service';
import { SeatRequestService } from '../../../core/services/seat-request.service';
import { TripService } from '../../../core/services/trip.service';
import { TPipe, tr } from '../../../core/i18n';

interface Target { id: number; name: string; }

/**
 * Califica a la otra parte de un viaje completado.
 * - Si fui pasajero → se califica al conductor (id sale del detalle del viaje).
 * - Si fui conductor → se elige a qué pasajero que viajó calificar (sale de las solicitudes del viaje).
 */
@Component({
  selector: 'app-rate-dialog',
  imports: [TPipe, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ 'Calificar viaje' | t }}</h2>
    <form [formGroup]="form" (ngSubmit)="send()">
      <mat-dialog-content>
        <p class="route">{{ data.origin }} → {{ data.destination }}</p>
        <mat-form-field appearance="outline">
          <mat-label>{{ data.role === 'PASSENGER' ? ('Conductor' | t) : ('Pasajero' | t) }}</mat-label>
          <mat-select formControlName="target">
            @for (t of targets(); track t.id) { <mat-option [value]="t.id">{{ t.name }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <div class="stars" role="radiogroup" [attr.aria-label]="'Puntaje' | t">
          @for (n of [1, 2, 3, 4, 5]; track n) {
            <button type="button" class="star" [class.on]="n <= form.controls.score.value" (click)="form.controls.score.setValue(n)" [attr.aria-label]="n + ' ' + ('estrellas' | t)">★</button>
          }
        </div>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'Comentario (opcional)' | t }}</mat-label>
          <textarea matInput rows="3" maxlength="255" formControlName="comment"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" mat-dialog-close>{{ 'Cancelar' | t }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid || sending()">{{ 'Enviar calificación' | t }}</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .route { font-weight: 700; }
    .stars { display: flex; gap: 4px; margin-bottom: 12px; }
    .star { border: 0; background: none; font-size: 32px; color: var(--line); cursor: pointer; }
    .star.on { color: #f5a524; }
  `,
})
export class RateDialog {
  readonly data = inject<TripHistoryItem>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<RateDialog, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly ratings = inject(RatingService);
  private readonly trips = inject(TripService);
  private readonly requests = inject(SeatRequestService);
  private readonly snack = inject(MatSnackBar);

  readonly targets = signal<Target[]>([]);
  readonly sending = signal(false);

  readonly form = this.fb.group({
    target: this.fb.control<number | null>(null, Validators.required),
    score: this.fb.nonNullable.control(5, [Validators.required, Validators.min(1), Validators.max(5)]),
    comment: this.fb.nonNullable.control(''),
  });

  constructor() {
    if (this.data.role === 'PASSENGER') {
      this.trips.getById(this.data.tripId).subscribe((t) => {
        this.targets.set([{ id: t.driverId, name: t.driverName }]);
        this.form.controls.target.setValue(t.driverId);
      });
    } else {
      this.requests.findByTrip(this.data.tripId).subscribe((list) => {
        const done = list.filter((r) => r.status === 'COMPLETED').map((r) => ({ id: r.passengerId, name: r.passengerName }));
        this.targets.set(done);
        if (done.length === 1) this.form.controls.target.setValue(done[0].id);
      });
    }
  }

  send() {
    const v = this.form.getRawValue();
    if (this.form.invalid || v.target === null) return;
    this.sending.set(true);
    this.ratings.rate({ tripId: this.data.tripId, ratedUserId: v.target, score: v.score, comment: v.comment || undefined }).subscribe({
      next: () => {
        this.snack.open(tr('¡Gracias por tu calificación!'), tr('Cerrar'), { duration: 3000 });
        this.ref.close(true);
      },
      error: (e) => {
        this.sending.set(false);
        this.snack.open(e.error?.message ?? tr('No se pudo calificar'), tr('Cerrar'), { duration: 4000 });
      },
    });
  }
}