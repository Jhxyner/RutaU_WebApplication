import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { AuthCard } from '../auth-card/auth-card';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, AuthCard],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate([this.home()]),
      error: (e) => {
        this.snack.open(e.error?.message ?? 'No se pudo iniciar sesión', 'Cerrar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  private home() {
    return this.auth.isAdmin() ? '/admin/reportes' : '/viajes';
  }
}