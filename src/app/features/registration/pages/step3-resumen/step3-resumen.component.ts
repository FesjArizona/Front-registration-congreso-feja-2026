import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationFormService } from '../../../../core/services/registration-form.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step3-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step3-resumen.component.html',
  styleUrl: './step3-resumen.component.scss'
})
export class Step3ResumenComponent {
  private formService = inject(RegistrationFormService);
  private router = inject(Router);

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
    const st = this.paso1Value.state;
    if (!st) return 'No especificado';
    const states: { [key: string]: string } = {
      'az': 'Arizona',
      'hw': 'Hawaii',
      'nevada': 'Nevada-Utah',
      'calif': 'California'
    };
    return states[st.toLowerCase()] || st;
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

  // Emergency contact fields
  get nombreContacto(): string {
    return this.paso2Value.nameContact || 'No especificado';
  }

  get telefonoContacto(): string {
    return this.paso2Value.phoneContact || 'No especificado';
  }

  get relacionContacto(): string {
    const rel = this.paso2Value.relationship.value || this.paso2Value.relationship || '';
    if (!rel) return 'No especificado';
    const relationships: { [key: string]: string } = {
      'esposo': 'Esposo(a)',
      'padres': 'Padres',
      'hermano': 'Hermano(a)',
      'familia': 'Familiar',
      'amigo': 'Amigo(a)',
      'otro': 'Otro'
    };
    return relationships[rel.toLowerCase()] || rel;
  }

  editarDatosPersonales(): void {
    this.router.navigate(['/registro/datos-personales']);
  }
}
