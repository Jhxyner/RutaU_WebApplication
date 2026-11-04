import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SeatRequest } from '../../../core/model/seat-request.model';
import { CompleteTripBody } from '../../../core/model/trip.model';
import { TPipe } from '../../../core/i18n';

export interface CompleteDialogData { passengers: SeatRequest[]; early: boolean; }

/** Marca quién viajó realmente y devuelve el body que espera POST /trips/{id}/complete. */
@Component({
  selector: 'app-complete-dialog',
  imports: [TPipe, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ 'Finalizar viaje' | t }}</h2>
    <mat-dialog-content>
      @if (data.early) {
        <p class="warn">{{ 'Aún no es la hora de salida. Si finalizas ahora se registrará como finalización anticipada.' | t }}</p>
      }
      @if (data.passengers.length === 0) {
        <p>{{ 'No hay pasajeros aceptados en este viaje.' | t }}</p>
      }
      @for (p of data.passengers; track p.id) {
        <div class="row">
          <strong>{{ p.passengerName }}</strong>
          <span class="toggle">
            <button type="button" class="tab" [class.on]="travelled().has(p.id)" (click)="set(p.id, true)">{{ 'Viajó' | t }}</button>
            <button type="button" class="tab" [class.on]="!travelled().has(p.id)" (click)="set(p.id, false)">{{ 'No se presentó' | t }}</button>
          </span>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>{{ 'Volver' | t }}</button>
      <button mat-flat-button (click)="confirm()">{{ 'Finalizar' | t }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); }
    .toggle { display: flex; gap: 6px; }
    .warn { background: var(--primary-soft); border-radius: 12px; padding: 12px; }
  `,
})
export class CompleteDialog {
  readonly data = inject<CompleteDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<CompleteDialog, CompleteTripBody>);
  /** Por defecto todos los aceptados se marcan como "Viajó". */
  readonly travelled = signal(new Set(this.data.passengers.map((p) => p.id)));

  set(id: number, yes: boolean) {
    this.travelled.update((s) => {
      const n = new Set(s);
      yes ? n.add(id) : n.delete(id);
      return n;
    });
  }

  confirm() {
    this.ref.close({ confirmEarly: this.data.early, completedRequestIds: [...this.travelled()] });
  }
}