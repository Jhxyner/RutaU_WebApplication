import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterRequest } from '../../../core/model/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { AuthCard } from '../auth-card/auth-card';
import { TPipe, tr } from '../../../core/i18n';

type Usage = 'passenger' | 'driver' | 'both';

/** Validador de grupo: la confirmación debe ser igual a la contraseña. */
function passwordsMatch(g: AbstractControl): ValidationErrors | null {
  return g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [TPipe, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatCheckboxModule, AuthCard],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly usage = signal<Usage>('passenger');

  readonly form = this.fb.nonNullable.group(
    {
      names: ['', Validators.required],
      lastNames: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/\.edu\.pe$/i)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    },
    { validators: passwordsMatch },
  );

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const [user, domain = ''] = v.email.split('@');
    // El diseño no pide "usuario" ni "universidad", pero la API sí: se derivan del correo.
    const body: RegisterRequest = {
      name: user,
      fullName: `${v.names} ${v.lastNames}`.trim(),
      email: v.email,
      password: v.password,
      university: domain.split('.')[0].toUpperCase(),
      acceptTerms: v.acceptTerms,
    };

    this.loading.set(true);
    this.auth.register(body).subscribe({
      next: () => this.router.navigate([this.usage() === 'driver' ? '/conductor/vehiculo' : '/pasajero/viajes']),
      error: (e) => {
        this.snack.open(e.error?.message ?? tr('No se pudo registrar'), tr('Cerrar'), { duration: 4000 });
        this.loading.set(false);
      },
    });
  }
}