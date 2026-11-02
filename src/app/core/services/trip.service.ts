import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../api';
import { Trip, TripBody, TripSearchResponse } from '../model/trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly http = inject(HttpClient);
  private readonly api = `${API_URL}/trips`;

  search(destination: string, maxPrice: number | null) {
    let params = new HttpParams();
    if (destination) params = params.set('destination', destination);
    if (maxPrice !== null) params = params.set('maxPrice', maxPrice);
    return this.http.get<TripSearchResponse>(`${this.api}/search`, { params });
  }

  findMine() { return this.http.get<Trip[]>(`${this.api}/me`); }
  create(body: TripBody) { return this.http.post<Trip>(this.api, body); }
  cancel(id: number, reason: string) { return this.http.patch<Trip>(`${this.api}/${id}/cancel`, { reason }); }
}