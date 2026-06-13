import { Component, Input, inject } from '@angular/core';
import { RegistrationFormService } from '../../../core/services/registration-form.service';

@Component({
  selector: 'app-stepper-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './stepper-sidebar.component.html',
  styleUrl: './stepper-sidebar.component.scss'
})
export class StepperSidebarComponent {
  @Input() currentStep: number = 0;
  private formService = inject(RegistrationFormService);

  isStepSolved(stepNumber: number): boolean {
    if (stepNumber >= this.currentStep) {
      return false;
    }
    const formGroup = this.formService.stepperForm.get(`paso${stepNumber}`);
    return formGroup ? formGroup.valid : true;
  }
}
