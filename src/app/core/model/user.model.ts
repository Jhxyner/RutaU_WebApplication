export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  fullName: string;
  university: string;
  district: string | null;
  role: Role;
}

export interface LoginRequest { email: string; password: string; }

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  fullName: string;
  university: string;
  district?: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthResponse { token: string; tokenType: string; user: User; }