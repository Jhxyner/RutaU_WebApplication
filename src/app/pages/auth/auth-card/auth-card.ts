import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-auth-card',
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.css',
})
export class AuthCard {
  readonly title = input.required<string>();
  readonly form = input.required<FormGroup>();
  readonly submitLabel = input.required<string>();
  readonly loading = input(false);
  readonly submitForm = output<void>();
}