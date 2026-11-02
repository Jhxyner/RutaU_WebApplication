import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../model/user.model';

const TOKEN_KEY = 'rutau_token';
const USER_KEY = 'rutau_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = `${API_URL}/auth`;

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<User | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isUser = computed(() => this._user()?.role === 'USER');

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, body).pipe(tap((r) => this.save(r)));
  }

  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, body).pipe(tap((r) => this.save(r)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  private save(r: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    this._token.set(r.token);
    this._user.set(r.user);
  }

  private readUser(): User | null {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); }
    catch { return null; }
  }
}