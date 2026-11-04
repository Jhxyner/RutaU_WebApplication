import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ScheduleComparison } from '../model/stats.model';

@Service()
export class StatsService {
  private readonly http = inject(HttpClient);

  scheduleComparison(zone = '') {
    let params = new HttpParams();
    if (zone) params = params.set('zone', zone);
    return this.http.get<ScheduleComparison>(`${environment.apiUrl}/stats/schedule-comparison`, { params });
  }
}