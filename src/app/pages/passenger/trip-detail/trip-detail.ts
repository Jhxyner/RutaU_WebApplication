import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicProfile } from '../../../core/model/user.model';
import { Trip } from '../../../core/model/trip.model';
import { AuthService } from '../../../core/services/auth.service';
import { ReportService } from '../../../core/services/report.service';
import { SeatRequestService } from '../../../core/services/seat-request.service';
import { TripService } from '../../../core/services/trip.service';
import { UserService } from '../../../core/services/user.service';
import { fmtDate, fmtTime, initials } from '../../../core/util';
import { StatusBadge } from '../../../shared/status-badge';
import { TPipe, tr } from '../../../core/i18n';

@Component({
  selector: 'app-trip-detail',
  imports: [TPipe, DecimalPipe, ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, StatusBadge],
  templateUrl: './trip-detail.html',
  styleUrl: './trip-detail.css',
})
export class TripDetail {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly auth = inject(AuthService);
  private readonly tripsApi = inject(TripService);
  private readonly users = inject(UserService);
  private readonly requests = inject(SeatRequestService);
  private readonly reports = inject(ReportService);

  readonly trip = signal<Trip | null>(null);
  readonly profile = signal<PublicProfile | null>(null);
  readonly pickup = signal<number | null>(null);
  readonly sending = signal(false);
  readonly requested = signal(false);
  readonly reporting = signal(false);

  readonly reportForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });

  readonly stops = computed(() => [...(this.trip()?.stops ?? [])].sort((a, b) => a.stopOrder - b.stopOrder));
  readonly isOwner = computed(() => this.trip()?.driverId === this.auth.user()?.id);
  readonly canRequest = computed(() => {
    const t = this.trip();
    return !!t && t.status === 'SCHEDULED' && t.availableSeats > 0 && !this.isOwner() && !this.requested();
  });
  readonly driverInitials = computed(() => initials(this.trip()?.driverName));

  protected readonly fmtDate = fmtDate;
  protected readonly fmtTime = fmtTime;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tripsApi.getById(id).subscribe({
      next: (t) => {
        this.trip.set(t);
        this.users.publicProfile(t.driverId).subscribe((p) => this.profile.set(p));
      },
      error: (e) => {
        this.snack.open(e.error?.message ?? tr('No se encontró el viaje'), tr('Cerrar'), { duration: 4000 });
        this.router.navigate(['/pasajero/viajes']);
      },
    });
  }

  pick(stopId: number | null) {
    this.pickup.set(stopId);
  }

  request(confirmOverlap = false) {
    const t = this.trip();
    if (!t) return;
    this.sending.set(true);
    this.requests.create({ tripId: t.id, pickupStopId: this.pickup(), confirmOverlap }).subscribe({
      next: () => {
        this.requested.set(true);
        this.sending.set(false);
        this.snack
          .open(tr('Solicitud enviada al conductor.'), tr('Ver estado'), { duration: 6000 })
          .onAction()
          .subscribe(() => this.router.navigate(['/pasajero/solicitudes']));
      },
      error: (e) => {
        this.sending.set(false);
        const msg: string = e.error?.message ?? tr('No se pudo solicitar el asiento');
        // La API avisa si el horario se cruza con otra solicitud y permite reenviar confirmando.
        if (e.status === 409 && msg.includes('confirmOverlap') && !confirmOverlap) {
          this.snack
            .open(tr('Ya tienes una solicitud que se cruza con este horario.'), tr('Continuar igual'), { duration: 8000 })
            .onAction()
            .subscribe(() => this.request(true));
          return;
        }
        this.snack.open(msg, tr('Cerrar'), { duration: 4000 });
      },
    });
  }

  sendReport() {
    const t = this.trip();
    if (!t || this.reportForm.invalid) return;
    this.reports.create({ tripId: t.id, reportedUserId: t.driverId, reason: this.reportForm.getRawValue().reason }).subscribe({
      next: () => {
        this.snack.open(tr('Reporte enviado. Un administrador lo revisará.'), tr('Cerrar'), { duration: 4000 });
        this.reportForm.reset();
        this.reporting.set(false);
      },
      error: (e) => this.snack.open(e.error?.message ?? tr('No se pudo enviar el reporte'), tr('Cerrar'), { duration: 4000 }),
    });
  }
}