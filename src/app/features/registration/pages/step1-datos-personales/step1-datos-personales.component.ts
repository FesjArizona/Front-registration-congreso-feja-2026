import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RegistrationFormService } from '../../../../core/services/registration-form.service';
import { ApiResponse } from '../../../../core/models/api-response.interface';
import { ApiService } from './../../../../core/services/api.service';
import { Conferences, Sizes, States } from '../../../../core/models/general.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-step1-datos-personales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step1-datos-personales.component.html',
  styleUrl: './step1-datos-personales.component.scss'
})
export class Step1DatosPersonalesComponent implements OnInit {
  paso1Form!: FormGroup;

  states = signal<States[]>([]);
  conferences = signal<Conferences[]>([]);
  cities = signal<string[]>([]);
  sizes = signal<Sizes[]>([]);

  constructor(
    private registrationFormService: RegistrationFormService,
    private apiService: ApiService
  ) { }

  ngOnInit() {

    this.paso1Form = this.registrationFormService.stepperForm.get('paso1') as FormGroup;
    this.getStates()
    this.getSizes()
    this.addStateEvent()
    this.addSizeEvent()
  }

  addStateEvent() {
    this.paso1Form.get('state')?.valueChanges.subscribe((stateId) => {
      this.paso1Form.get('city')?.setValue('')
      this.loadConferencesAndCities(stateId);
    });
  }

  loadConferencesAndCities(stateId: string | number) {
    if (!stateId) return;

    const parsedId = typeof stateId === 'string' ? parseInt(stateId) : stateId;

    const state = this.states().find(s => s.id === parsedId);

    if (state != undefined) {
      this.registrationFormService.setSelectedStateName(state.nombre);

      this.apiService.getCities(state.nombre).subscribe({
        next: (response: ApiResponse<string[]>) => {
          this.cities.set(response.data);
        },
        error: (error: HttpErrorResponse) => { },
      });
    }

    this.apiService.getConferences(parsedId).subscribe({
      next: (response: ApiResponse<Conferences[]>) => {
        this.conferences.set(response.data);
      },
      error: (error: HttpErrorResponse) => { },
    });
  }


  addSizeEvent() {
    this.paso1Form.get('sizeShirt')?.valueChanges.subscribe((sizeId) => {
      if (sizeId) {
        const size = this.sizes().find(s => s.id === parseInt(sizeId));
        if (size != undefined) {
          this.registrationFormService.setSizeName(size.talla);
        }
      }
    });
  }


  getSizes() {
    this.apiService.getSizes().subscribe({
      next: (response: ApiResponse<Sizes[]>) => {
        this.sizes.set(response.data);
        this.checkInitialSize();
      },
      error: (error: HttpErrorResponse) => { },
    });
  }

  checkInitialSize() {
    const sizeId = this.paso1Form.get('sizeShirt')?.value;
    if (sizeId) {
      const size = this.sizes().find(s => s.id === parseInt(sizeId));
      if (size != undefined) {
        this.registrationFormService.setSizeName(size.talla);
      }
    }
  }
  getStates() {
    this.apiService.getStates().subscribe({
      next: (response: ApiResponse<States[]>) => {
        this.states.set(response.data);

        const currentStateId = this.paso1Form.get('state')?.value;
        if (currentStateId) {
          this.loadConferencesAndCities(currentStateId);
        }
      },
      error: (error: HttpErrorResponse) => { },
    });
  }
}
