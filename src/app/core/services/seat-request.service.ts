import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SeatRequest, SeatRequestBody } from '../model/seat-request.model';

@Service()
export class SeatRequestService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/seat-requests`;

  create(body: SeatRequestBody) {
    return this.http.post<SeatRequest>(this.api, body);
  }

  findMine() {
    return this.http.get<SeatRequest[]>(`${this.api}/me`);
  }

  findByTrip(tripId: number) {
    return this.http.get<SeatRequest[]>(`${this.api}/trip/${tripId}`);
  }

  accept(id: number) {
    return this.http.patch<SeatRequest>(`${this.api}/${id}/accept`, {});
  }

  reject(id: number) {
    return this.http.patch<SeatRequest>(`${this.api}/${id}/reject`, {});
  }

  cancel(id: number, reason: string) {
    return this.http.patch<SeatRequest>(`${this.api}/${id}/cancel`, { reason });
  }
}