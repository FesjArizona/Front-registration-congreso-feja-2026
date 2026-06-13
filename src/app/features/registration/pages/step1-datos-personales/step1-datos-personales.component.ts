import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RegistrationFormService } from '../../../../core/services/registration-form.service';

@Component({
  selector: 'app-step1-datos-personales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step1-datos-personales.component.html',
  styleUrl: './step1-datos-personales.component.scss'
})
export class Step1DatosPersonalesComponent implements OnInit {
  paso1Form!: FormGroup;

  constructor(private registrationFormService: RegistrationFormService) {}

  ngOnInit() {
    this.paso1Form = this.registrationFormService.stepperForm.get('paso1') as FormGroup;
  }
}
