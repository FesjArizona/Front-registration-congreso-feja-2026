import { Component, OnInit } from '@angular/core';
import { StepperSidebarComponent } from '../../../shared/components/stepper-sidebar/stepper-sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TopbarMobileComponent } from '../../../shared/components/topbar-mobile/topbar-mobile.component';
import { FooterBarComponent } from '../../../shared/components/footer-bar/footer-bar.component';
import { FormGroup } from '@angular/forms';
import { RegistrationFormService } from '../../../core/services/registration-form.service';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [StepperSidebarComponent, CommonModule, RouterOutlet, TopbarMobileComponent, FooterBarComponent],
  selector: 'app-registration-layout',
  templateUrl: './registration-layout.component.html',
  styleUrls: ['./registration-layout.component.scss']
})
export class RegistrationLayoutComponent implements OnInit {

  // Control del paso actual: 0 a 5.
  activeStep: number = 0;
  totalSteps: number = 5;

  stepperForm!: FormGroup;

  // array of routes for steps
  private stepRoutes = [
    '', // Step 0: info-general
    'datos-personales', // Step 1
    'contacto-emergencia', // Step 2
    'resumen', // Step 3
    'confirmacion', // Step 4
    'recibido' // Step 5
  ];

  constructor(
    private registrationFormService: RegistrationFormService,
    private router: Router
  ) {
    // Detectar ruta actual para sincronizar activateStep
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const urlSegment = event.urlAfterRedirects.split('/').pop() || '';
      // Excluir 'registro' que es el base path
      const cleanSegment = urlSegment === 'registro' ? '' : urlSegment;
      const index = this.stepRoutes.indexOf(cleanSegment);
      if (index !== -1) {
        this.activeStep = index;
      }
    });
  }

  ngOnInit(): void {
    // Obtener formulario centralizado
    this.stepperForm = this.registrationFormService.stepperForm;
  }

  get isCurrentStepValid(): boolean {
    if (this.activeStep === 0) return true; // El paso 0 no tiene form validable estricto
    const currentFormGroup = this.stepperForm.get(`paso${this.activeStep}`);
    return currentFormGroup ? currentFormGroup.valid : true;
  }

  avanzarPaso(): void {
    if (this.isCurrentStepValid && this.activeStep < this.totalSteps) {
      this.activeStep++;
      this.navigateToStep(this.activeStep);
    } else if (this.activeStep === this.totalSteps && this.stepperForm.valid) {
      this.enviarFormulario();
    }
  }

  retrocederPaso(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
      this.navigateToStep(this.activeStep);
    }
  }

  private navigateToStep(stepIndex: number): void {
    const route = this.stepRoutes[stepIndex];
    if (route === '') {
      this.router.navigate(['/registro']);
    } else {
      this.router.navigate(['/registro', route]);
    }
  }

  enviarFormulario(): void {
    console.log('¡Formulario enviado con éxito!', this.stepperForm.value);
  }

}
