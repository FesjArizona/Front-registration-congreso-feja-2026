import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stepper-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './stepper-sidebar.component.html',
  styleUrl: './stepper-sidebar.component.scss'
})
export class StepperSidebarComponent {
  @Input() currentStep: number = 0;
}
