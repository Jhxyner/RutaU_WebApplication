import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { TripHistory, TripHistoryItem } from '../../../core/model/history.model';
import { RatingHistory } from '../../../core/model/rating.model';
import { HistoryService } from '../../../core/services/history.service';
import { RatingService } from '../../../core/services/rating.service';
import { fmtDate, fmtTime, initials } from '../../../core/util';
import { StatusBadge } from '../../../shared/status-badge';
import { RateDialog } from './rate-dialog';
import { TPipe } from '../../../core/i18n';

type Tab = 'done' | 'received';

@Component({
  selector: 'app-history',
  imports: [TPipe, DecimalPipe, MatCardModule, MatButtonModule, StatusBadge],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  private readonly historyApi = inject(HistoryService);
  private readonly ratingsApi = inject(RatingService);
  private readonly dialog = inject(MatDialog);

  readonly tab = signal<Tab>('done');
  readonly history = signal<TripHistory | null>(null);
  readonly received = signal<RatingHistory | null>(null);

  readonly done = computed(() => {
    const h = this.history();
    if (!h) return [];
    return [...h.asDriver, ...h.asPassenger].sort((a, b) => b.departureTime.localeCompare(a.departureTime));
  });
  readonly completed = computed(() => this.done().filter((i) => i.status === 'COMPLETED'));
  /** El viaje completado más reciente: se invita a calificarlo arriba, como en el diseño. */
  readonly latest = computed(() => this.completed()[0] ?? null);
  readonly average = computed(() => this.received()?.average ?? null);

  protected readonly fmtDate = fmtDate;
  protected readonly fmtTime = fmtTime;
  protected readonly initials = initials;

  constructor() {
    this.historyApi.trips().subscribe((h) => this.history.set(h));
    this.ratingsApi.mine().subscribe((r) => this.received.set(r));
  }

  rate(item: TripHistoryItem) {
    this.dialog.open(RateDialog, { width: '460px', data: item });
  }

  stars(n: number) {
    const k = Math.max(0, Math.min(5, Math.round(n)));
    return '★'.repeat(k) + '☆'.repeat(5 - k);
  }
}