import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TripHistory } from '../model/history.model';

@Service()
export class HistoryService {
  private readonly http = inject(HttpClient);

  trips() {
    return this.http.get<TripHistory>(`${environment.apiUrl}/history/trips`);
  }
}