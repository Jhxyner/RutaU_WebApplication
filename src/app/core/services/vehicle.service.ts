import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api';
import { Vehicle, VehicleBody } from '../model/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly api = `${API_URL}/vehicles`;

  findMine() { return this.http.get<Vehicle>(`${this.api}/me`); }
  create(body: VehicleBody) { return this.http.post<Vehicle>(this.api, body); }
  update(body: VehicleBody) { return this.http.put<Vehicle>(`${this.api}/me`, body); }
}