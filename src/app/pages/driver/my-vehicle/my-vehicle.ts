import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Vehicle } from '../../../core/model/vehicle.model';
import { VehicleService } from '../../../core/services/vehicle.service';
import { TPipe, tr } from '../../../core/i18n';

@Component({
  selector: 'app-my-vehicle',
  imports: [TPipe, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './my-vehicle.html',
  styleUrl: './my-vehicle.css',
})
export class MyVehicle {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(VehicleService);
  private readonly snack = inject(MatSnackBar);

  /** null = aún no registrado → el formulario crea (POST); con valor → edita (PUT /me). */
  readonly vehicle = signal<Vehicle | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    brand: ['', [Validators.required, Validators.maxLength(50)]],
    model: ['', [Validators.required, Validators.maxLength(50)]],
    color: [''],
    plate: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{3}-?[A-Za-z0-9]{3,4}$/)]],
    capacity: [4, [Validators.required, Validators.min(1), Validators.max(8)]],
  });

  constructor() {
    this.service.findMine().subscribe({
      next: (v) => {
        this.vehicle.set(v);
        this.form.patchValue({ ...v, color: v.color ?? '' });
      },
      // 404 = todavía no tiene vehículo, es un estado normal.
      error: () => this.vehicle.set(null),
    });
  }

  /** "Descartar": vuelve a los datos guardados (o limpia el formulario si aún no hay vehículo). */
  discard() {
    const v = this.vehicle();
    if (v) this.form.reset({ ...v, color: v.color ?? '' });
    else this.form.reset({ brand: '', model: '', color: '', plate: '', capacity: 4 });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body = { ...v, plate: v.plate.toUpperCase(), color: v.color || null };
    this.saving.set(true);
    const call = this.vehicle() ? this.service.update(body) : this.service.create(body);
    call.subscribe({
      next: (saved) => {
        this.vehicle.set(saved);
        this.saving.set(false);
        this.snack.open(tr('Vehículo guardado'), tr('Cerrar'), { duration: 2500 });
      },
      error: (e) => {
        this.saving.set(false);
        this.snack.open(e.error?.message ?? tr('No se pudo guardar'), tr('Cerrar'), { duration: 4000 });
      },
    });
  }
}