import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleBody } from '../model/vehicle.model';

@Service()
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/vehicles`;

  findMine() {
    return this.http.get<Vehicle>(`${this.api}/me`);
  }

  create(body: VehicleBody) {
    return this.http.post<Vehicle>(this.api, body);
  }

  update(body: VehicleBody) {
    return this.http.put<Vehicle>(`${this.api}/me`, body);
  }
}