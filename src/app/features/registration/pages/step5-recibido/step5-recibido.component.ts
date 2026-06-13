import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationFormService } from '../../../../core/services/registration-form.service';

@Component({
  selector: 'app-step5-recibido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step5-recibido.component.html',
  styleUrl: './step5-recibido.component.scss'
})
export class Step5RecibidoComponent {
  private formService = inject(RegistrationFormService);

  get primerNombre(): string {
    const name: string = this.formService.stepperForm.get('paso1')?.value?.name || '';
    return name.split(' ')[0] || 'Amigo';
  }

  get correoElectronico(): string {
    return this.formService.stepperForm.get('paso1')?.value?.email || '';
  }

  irAFeja(): void {
    window.open('https://congreso-union.fesjaz.com', '_blank');
  }
}
