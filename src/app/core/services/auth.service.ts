import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../model/user.model';

const TOKEN_KEY = 'rutau.token';
const USER_KEY = 'rutau.user';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<User | null>(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isUser = computed(() => this._user()?.role === 'USER');

  login(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, body).pipe(tap((r) => this.store(r)));
  }

  register(body: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, body).pipe(tap((r) => this.store(r)));
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private store(r: AuthResponse) {
    this._token.set(r.token);
    this._user.set(r.user);
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
  }
}