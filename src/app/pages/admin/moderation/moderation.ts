import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModerationAction, Report, ReportStatus, UserModeration } from '../../../core/model/report.model';
import { AdminService } from '../../../core/services/admin.service';
import { fmtDate, fmtTime, initials, relTime } from '../../../core/util';
import { StatusBadge } from '../../../shared/status-badge';
import { TPipe, tr } from '../../../core/i18n';

type Filter = ReportStatus | 'ALL';

@Component({
  selector: 'app-moderation',
  imports: [TPipe, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, StatusBadge],
  templateUrl: './moderation.html',
  styleUrl: './moderation.css',
})
export class Moderation {
  private readonly fb = inject(FormBuilder);
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);

  readonly filter = signal<Filter>('PENDING');
  /** Todos los reportes: se filtran en pantalla para poder mostrar los contadores de cada pestaña. */
  readonly all = signal<Report[]>([]);
  readonly reports = computed(() => (this.filter() === 'ALL' ? this.all() : this.all().filter((r) => r.status === this.filter())));
  readonly pendingCount = computed(() => this.all().filter((r) => r.status === 'PENDING').length);
  readonly selected = signal<Report | null>(null);
  readonly userInfo = signal<UserModeration | null>(null);
  readonly working = signal(false);

  readonly notes = this.fb.nonNullable.control('');
  readonly isPending = computed(() => this.selected()?.status === 'PENDING');

  protected readonly fmtDate = fmtDate;
  protected readonly fmtTime = fmtTime;
  protected readonly initials = initials;
  protected readonly relTime = relTime;

  constructor() {
    this.load();
  }

  setFilter(f: Filter) {
    this.filter.set(f);
    this.selected.set(null);
  }

  load() {
    this.admin.reports().subscribe((r) => this.all.set([...r].sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
  }

  select(r: Report) {
    this.selected.set(r);
    this.notes.reset();
    this.userInfo.set(null);
    this.admin.userHistory(r.reportedUserId).subscribe((u) => this.userInfo.set(u));
  }

  act(action: ModerationAction) {
    const r = this.selected();
    if (!r) return;
    this.working.set(true);
    this.admin.moderate(r.id, { action, notes: this.notes.value || undefined }).subscribe({
      next: (u) => {
        this.working.set(false);
        this.snack.open(tr('Reporte actualizado'), tr('Cerrar'), { duration: 2500 });
        this.selected.set(u);
        this.load();
        this.admin.userHistory(u.reportedUserId).subscribe((x) => this.userInfo.set(x));
      },
      error: (e) => {
        this.working.set(false);
        this.snack.open(e.error?.message ?? tr('No se pudo aplicar la acción'), tr('Cerrar'), { duration: 4000 });
      },
    });
  }
}