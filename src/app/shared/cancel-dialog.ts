import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TPipe } from '../core/i18n';

export interface CancelDialogData { title: string; confirmLabel: string; }

/** Pide el motivo (la API lo exige) al cancelar un viaje o una solicitud. Devuelve el texto. */
@Component({
  selector: 'app-cancel-dialog',
  imports: [TPipe, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title | t }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline">
        <mat-label>{{ 'Motivo' | t }}</mat-label>
        <textarea matInput rows="3" maxlength="255" [formControl]="reason"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>{{ 'Volver' | t }}</button>
      <button mat-flat-button [disabled]="reason.invalid" [mat-dialog-close]="reason.value">{{ data.confirmLabel | t }}</button>
    </mat-dialog-actions>
  `,
})
export class CancelDialog {
  readonly data = inject<CancelDialogData>(MAT_DIALOG_DATA);
  readonly reason = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] });
}