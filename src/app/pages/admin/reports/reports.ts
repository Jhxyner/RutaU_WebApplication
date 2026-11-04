import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DemandReport, ReportCount } from '../../../core/model/stats.model';
import { AdminService } from '../../../core/services/admin.service';
import { downloadBlob } from '../../../core/util';
import { TPipe, tr } from '../../../core/i18n';

/** Periodos predefinidos (días hacia atrás desde hoy). */
const PERIODS = [
  { days: 7, label: 'Últimos 7 días' },
  { days: 30, label: 'Últimos 30 días' },
  { days: 90, label: 'Últimos 90 días' },
];

/** Fecha local en formato yyyy-MM-dd (lo que espera la API). */
function isoDay(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

@Component({
  selector: 'app-reports',
  imports: [TPipe, MatCardModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);

  protected readonly periods = PERIODS;
  readonly period = signal(30);
  readonly report = signal<DemandReport | null>(null);
  readonly loading = signal(false);

  readonly topRoute = computed(() => this.report()?.topRoutes[0] ?? null);
  readonly topHour = computed(() => this.report()?.topHours[0] ?? null);
  readonly maxRoute = computed(() => Math.max(1, ...(this.report()?.topRoutes ?? []).map((r) => r.requests)));
  readonly maxHour = computed(() => Math.max(1, ...(this.report()?.topHours ?? []).map((r) => r.requests)));
  readonly maxTime = computed(() => Math.max(1, ...(this.report()?.timeline ?? []).map((r) => r.requests)));

  constructor() {
    this.load();
  }

  private range() {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - this.period());
    return { from: isoDay(from), to: isoDay(to) };
  }

  setPeriod(days: number) {
    this.period.set(days);
    this.load();
  }

  load() {
    const { from, to } = this.range();
    this.loading.set(true);
    this.admin.demand(from, to).subscribe({
      next: (r) => {
        this.report.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.snack.open(e.error?.message ?? tr('No se pudo cargar el reporte'), tr('Cerrar'), { duration: 4000 });
      },
    });
  }

  export(format: 'xlsx' | 'pdf') {
    const { from, to } = this.range();
    this.admin.exportDemand(format, from, to).subscribe({
      next: (blob) => downloadBlob(blob, `reporte-demanda.${format}`),
      error: () => this.snack.open(tr('No se pudo exportar el reporte'), tr('Cerrar'), { duration: 4000 }),
    });
  }

  pct(item: ReportCount, max: number) {
    return Math.round((item.requests / max) * 100);
  }
}