import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../core/model/vehicle.model';

@Component({
  selector: 'app-my-vehicle',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './my-vehicle.html',
  styleUrl: './my-vehicle.css',
})
export class MyVehicle {
  private readonly fb = inject(FormBuilder);
  private readonly vehicles = inject(VehicleService);
  private readonly snack = inject(MatSnackBar);

  readonly vehicle = signal<Vehicle | null>(null);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    brand: ['', Validators.required],
    model: ['', Validators.required],
    color: [''],
    plate: ['', Validators.required],
    capacity: [4, [Validators.required, Validators.min(1), Validators.max(8)]],
  });

  constructor() { this.load(); }

  private load() {
    this.vehicles.findMine().subscribe({
      next: (v) => this.vehicle.set(v),
      error: () => this.vehicle.set(null),
    });
  }

  save() {
    if (this.form.invalid) return;
    const body = this.form.getRawValue();
    const id = this.editingId();
    const req = id ? this.vehicles.update(body) : this.vehicles.create(body);
    req.subscribe({
      next: () => { this.cancel(); this.load(); this.snack.open('Guardado', 'Cerrar', { duration: 2000 }); },
      error: (e) => this.snack.open(e.error?.message ?? 'Error', 'Cerrar', { duration: 4000 }),
    });
  }

  edit(v: Vehicle) {
    this.editingId.set(v.id);
    this.form.setValue({ brand: v.brand, model: v.model, color: v.color ?? '', plate: v.plate, capacity: v.capacity });
  }

  cancel() { this.editingId.set(null); this.form.reset(); }
}