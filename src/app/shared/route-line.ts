import { Component, input } from '@angular/core';

/** La línea de ruta del style guide: punto vacío (salida) -> punto lleno (llegada). */
@Component({
  selector: 'app-route-line',
  template: `
    <div class="route">
      <span class="row from">{{ origin() }}</span>
      <span class="row to">{{ destination() }}</span>
    </div>
  `,
  styles: `
    .route { position: relative; display: flex; flex-direction: column; gap: 14px; padding-left: 24px; }
    .route::before { content: ''; position: absolute; left: 5px; top: 12px; bottom: 12px; width: 2px; background: var(--primary); }
    .row { position: relative; font-weight: 700; font-size: 14px; }
    .row::before { content: ''; position: absolute; left: -24px; top: 3px; width: 12px; height: 12px; border-radius: 50%; box-sizing: border-box; }
    .from::before { border: 2px solid var(--primary); background: #fff; }
    .to::before { background: var(--secondary); }
  `,
})
export class RouteLine {
  readonly origin = input.required<string>();
  readonly destination = input.required<string>();
}