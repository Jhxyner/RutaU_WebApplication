import { Component, inject, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LanguageService } from '../../../core/services/language.service';
import { TPipe } from '../../../core/i18n';

@Component({
  selector: 'app-auth-card',
  imports: [TPipe, ReactiveFormsModule, MatCardModule, MatButtonModule],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.css',
})
export class AuthCard {
  protected readonly lang = inject(LanguageService);

  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly form = input.required<FormGroup>();
  readonly submitLabel = input.required<string>();
  readonly loading = input(false);
  readonly submitForm = output<void>();
}