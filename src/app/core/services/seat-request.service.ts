import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class SeatRequestService {
  private readonly http = inject(HttpClient);

  create(body: { tripId: number; pickupStopId: number | null }) {
        return this.http.post(`${API_URL}/seat-requests`, body);
    }
}