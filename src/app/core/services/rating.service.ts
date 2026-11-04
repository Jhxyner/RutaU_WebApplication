import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RatedRole, Rating, RatingBody, RatingHistory } from '../model/rating.model';

@Service()
export class RatingService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/ratings`;

  rate(body: RatingBody) {
    return this.http.post<Rating>(this.api, body);
  }

  /** Calificaciones que he recibido, con filtro opcional por rol. */
  mine(role?: RatedRole) {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    return this.http.get<RatingHistory>(`${this.api}/me`, { params });
  }
}