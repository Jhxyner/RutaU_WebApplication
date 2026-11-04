import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CompleteTripBody, Trip, TripBody, TripCompletion, TripFilters, TripSearchResponse } from '../model/trip.model';

@Service()
export class TripService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/trips`;

  search(f: TripFilters = {}) {
    let params = new HttpParams();
    if (f.origin) params = params.set('origin', f.origin);
    if (f.destination) params = params.set('destination', f.destination);
    if (f.from) params = params.set('from', f.from);
    if (f.to) params = params.set('to', f.to);
    if (f.zone) params = params.set('zone', f.zone);
    if (f.maxPrice !== null && f.maxPrice !== undefined) params = params.set('maxPrice', f.maxPrice);
    return this.http.get<TripSearchResponse>(`${this.api}/search`, { params });
  }

  getById(id: number) {
    return this.http.get<Trip>(`${this.api}/${id}`);
  }

  findMine() {
    return this.http.get<Trip[]>(`${this.api}/me`);
  }

  create(body: TripBody) {
    return this.http.post<Trip>(this.api, body);
  }

  complete(id: number, body: CompleteTripBody) {
    return this.http.patch<TripCompletion>(`${this.api}/${id}/complete`, body);
  }

  cancel(id: number, reason: string) {
    return this.http.patch<Trip>(`${this.api}/${id}/cancel`, { reason });
  }
}