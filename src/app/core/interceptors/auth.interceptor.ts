import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const lang = inject(LanguageService);
  const router = inject(Router);

  const isAuthCall = req.url.includes('/auth/');
  const headers: Record<string, string> = { 'Accept-Language': lang.header() };
  const token = auth.token();
  if (token && !isAuthCall) headers['Authorization'] = `Bearer ${token}`;

  return next(req.clone({ setHeaders: headers })).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401 && !isAuthCall) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => e);
    }),
  );
};