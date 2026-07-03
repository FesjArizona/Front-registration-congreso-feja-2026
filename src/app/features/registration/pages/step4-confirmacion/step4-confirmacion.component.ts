import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationFormService } from '../../../../core/services/registration-form.service';
import { Router } from '@angular/router';
import { EmergencyData, UserDataRegister } from '../../../../core/models/registration-to-save.interface';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '../../../../core/models/api-response.interface';
import { ApiService } from './../../../../core/services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-step4-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step4-confirmacion.component.html',
  styleUrl: './step4-confirmacion.component.scss'
})
export class Step4ConfirmacionComponent {
  private formService = inject(RegistrationFormService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  eventId: string | null = null;

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      this.eventId = params.get('id');
    });
  }

  get paso1Value() {
    return this.formService.stepperForm.get('paso1')?.value || {};
  }

  get paso2Value() {
    return this.formService.stepperForm.get('paso2')?.value || {};
  }

  get nombreCompleto(): string {
    const val = this.paso1Value;
    const name = val.name || '';
    const lastname = val.lastname || '';
    return `${name} ${lastname}`.trim() || 'No especificado';
  }

  get correoElectronico(): string {
    return this.paso1Value.email || 'No especificado';
  }

  get telefono(): string {
    return this.paso1Value.phone || 'No especificado';
  }

  get fechaNacimiento(): string {
    const birth = this.paso1Value.age;
    if (!birth) return 'No especificado';
    const parts = birth.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return birth;
  }

  get edad(): string {
    const birth = this.paso1Value.age;
    if (!birth) return 'No especificado';
    const birthDate = new Date(birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} Años`;
  }

  get genero(): string {
    const g = this.paso1Value.gender;
    if (!g) return 'No especificado';
    if (g.toLowerCase() === 'masc') return 'Masculino';
    if (g.toLowerCase() === 'fem') return 'Femenino';
    return g;
  }

  get estado(): string {
    return this.formService.getSelectednames().stateName
  }

  get ciudad(): string {
    return this.paso1Value.city || 'No especificado';
  }

  get iglesia(): string {
    return this.paso1Value.church || 'No especificado';
  }

  get tallaCamiseta(): string {
    const t = this.paso1Value.sizeShirt;
    if (!t) return 'No especificado';
    const sizes: { [key: string]: string } = {
      's': 'Small',
      'm': 'Medium',
      'l': 'Large',
      'xl': 'Extra Large'
    };
    return sizes[t.toLowerCase()] || t;
  }

  get esChaperon(): string {
    const chap = this.paso1Value.isChaperone;
    if (chap === undefined || chap === null || chap === '') return 'No especificado';
    return chap === true || chap === 'true' ? 'Sí' : 'No';
  }

  get nombreContacto(): string {
    return this.paso2Value.nameContact || 'No especificado';
  }

  get telefonoContacto(): string {
    return this.paso2Value.phoneContact || 'No especificado';
  }

  get relacionContacto(): string {
    const rel = this.paso2Value.relationship;
    if (!rel) return 'No especificado';
    const relationships: { [key: string]: string } = {
      'familia': 'Familiar',
      'amigo': 'Amigo',
      'otro': 'Otro'
    };
    return relationships[rel.toLowerCase()] || rel;
  }

  regresar(): void {
    this.router.navigate(['/registro/resumen']);
  }

  finalizar(): void {
    const data: UserDataRegister = {
      conferencia_id: this.paso1Value.conference,
      talla_camiseta_id: this.paso1Value.sizeShirt,
      nombre: this.paso1Value.name,
      apellidos: this.paso1Value.lastname,
      correo: this.paso1Value.email,
      telefono: this.paso1Value.phone,
      fecha_nacimiento: this.paso1Value.age,
      genero: this.paso1Value.gender,
      estado_id: this.paso1Value.state,
      ciudad: this.paso1Value.city,
      iglesia: this.paso1Value.church,
      incluir_lunchtime: this.paso1Value.includesLunch,
      es_chaperon: this.paso1Value.isChaperone,
      incluir_camisa: this.paso1Value.includesTshirt,
      tipo_alimento: this.paso1Value.foodPreference,
      alimento_especial_nota: this.paso1Value.foodPreferenceDetails,
      contacto_emergencia: {
        nombre_contacto: this.paso2Value.nameContact,
        telefono_contacto: this.paso2Value.phoneContact,
        relacion: this.paso2Value.relationship
      }
    }


    this.apiService.saveRegister(data, this.eventId).subscribe({
      next: (response: ApiResponse<number>) => {
        if (response.data != null) {
          this.router.navigate(['/registro', this.eventId, 'recibido']);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al guardar el registro', error);
      },
      complete: () => {
      },
    });
  }
}
