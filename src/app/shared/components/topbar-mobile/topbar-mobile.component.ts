import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-topbar-mobile',
  standalone: true,
  imports: [],
  templateUrl: './topbar-mobile.component.html',
  styleUrls: ['./topbar-mobile.component.scss']
})
export class TopbarMobileComponent {

  // Puedes cambiar estos valores manualmente o pasarlos como @Input()
  @Input() currentStep: number = 0;
  @Input() totalSteps: number = 5;

  // Circunferencia del círculo (2 * Math.PI * r) -> 2 * 3.1416 * 40 = ~251.2
  readonly circumference = 251.2;

  // Calcula cuánto se debe "esconder" del trazo verde
  get strokeDashoffset(): number {
    if (this.totalSteps <= 0) return this.circumference;

    // Validamos que el paso actual no supere el total
    const current = Math.min(Math.max(this.currentStep, 0), this.totalSteps);
    const percentage = current / this.totalSteps;

    // Si es 0, mostramos un pequeño porcentaje mínimo para que se vea el "punto" inicial redondeado de tu UI
    if (current === 0) {
      return this.circumference - 3;
    }

    return this.circumference - (percentage * this.circumference);
  }

}
