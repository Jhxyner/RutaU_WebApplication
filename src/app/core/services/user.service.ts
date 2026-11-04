import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PublicProfile, User } from '../model/user.model';

@Service()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getMe() {
    return this.http.get<User>(`${this.api}/users/me`);
  }

  publicProfile(id: number) {
    return this.http.get<PublicProfile>(`${this.api}/users/${id}/profile`);
  }
}