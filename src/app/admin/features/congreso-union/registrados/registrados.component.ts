import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Participante } from '../../../core/models/participants.model';
import { ParticipantesService } from '../../../core/services/participants.service';


declare var bootstrap: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-registrados',
  templateUrl: './registrados.component.html',
  styleUrls: ['./registrados.component.scss']
})
export class RegistradosComponent implements OnInit, OnDestroy {

  participantes: Participante[] = [];

  estadosDisponibles: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  private readonly avatarPalette: string[] = [
    '#F2994A', '#2D9CDB', '#9B51E0', '#EB5757', '#F2C94C',
    '#27AE60', '#5B6FE0', '#EE6C9B', '#56C2C0', '#BB6BD9'
  ];

  // ---------- filtros ----------
  busqueda = '';
  filtroEstado = '';
  filtroCheckin = '';

  // ---------- paginación ----------
  paginaActual = 1;
  porPagina = 5;
  opcionesPorPagina = [5, 10, 20, 50, 100];

  // ---------- formulario del modal ----------
  form: FormGroup;
  editandoId: number | null = null;
  participanteAEliminar: Participante | null = null;

  private participantModal: any;
  private deleteModal: any;
  private suscripcion?: Subscription;

  constructor(
    private participantesService: ParticipantesService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      contacto: ['', [Validators.required, Validators.email]],
      estado: ['', Validators.required],
      checkin: ['Pendiente', Validators.required],
      registro: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.suscripcion = this.participantesService.getParticipantes().subscribe(data => {
      this.participantes = data;
      if (this.paginaActual > this.totalPaginas) {
        this.paginaActual = this.totalPaginas;
      }
    });

    const modalEl = document.getElementById('participantModal');
    const deleteEl = document.getElementById('deleteModal');
    if (modalEl) this.participantModal = new bootstrap.Modal(modalEl);
    if (deleteEl) this.deleteModal = new bootstrap.Modal(deleteEl);
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  // ---------- datos derivados (filtros + paginación) ----------
  get participantesFiltrados(): Participante[] {
    const termino = this.busqueda.trim().toLowerCase();
    return this.participantes.filter(p => {
      const coincideBusqueda = !termino ||
        p.nombre.toLowerCase().includes(termino) ||
        p.telefono.includes(termino) ||
        p.contacto.toLowerCase().includes(termino);
      const coincideEstado = !this.filtroEstado || p.estado === this.filtroEstado;
      const coincideCheckin = !this.filtroCheckin || p.checkin === this.filtroCheckin;
      return coincideBusqueda && coincideEstado && coincideCheckin;
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.participantesFiltrados.length / this.porPagina));
  }

  get participantesPagina(): Participante[] {
    const inicio = (this.paginaActual - 1) * this.porPagina;
    return this.participantesFiltrados.slice(inicio, inicio + this.porPagina);
  }

  /** Rango de botones de paginación, con '...' donde se colapsan páginas intermedias */
  get rangoPaginas(): (number | string)[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const rango: (number | string)[] = [];
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || (p >= actual - 1 && p <= actual + 1)) {
        rango.push(p);
      } else if (rango[rango.length - 1] !== '...') {
        rango.push('...');
      }
    }
    return rango;
  }

  onBusquedaChange(): void { this.paginaActual = 1; }
  onFiltroChange(): void { this.paginaActual = 1; }
  onPorPaginaChange(): void { this.paginaActual = 1; }

  irAPagina(pagina: number | string): void {
    if (pagina === '...') return;
    const destino = Math.min(Math.max(Number(pagina), 1), this.totalPaginas);
    this.paginaActual = destino;
  }

  anterior(): void { this.irAPagina(this.paginaActual - 1); }
  siguiente(): void { this.irAPagina(this.paginaActual + 1); }

  // ---------- helpers visuales ----------
  colorAvatar(nombre: string): string {
    return this.avatarPalette[nombre.charCodeAt(0) % this.avatarPalette.length];
  }

  inicial(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }

  // ---------- modal crear / editar ----------
  abrirModalNuevo(): void {
    this.editandoId = null;
    this.form.reset({
      nombre: '',
      telefono: '',
      contacto: '',
      estado: '',
      checkin: 'Pendiente',
      registro: this.hoyIso(),
    });
    this.participantModal?.show();
  }

  abrirModalEditar(p: Participante): void {
    this.editandoId = p.id;
    this.form.setValue({
      nombre: p.nombre,
      telefono: p.telefono,
      contacto: p.contacto,
      estado: p.estado,
      checkin: p.checkin,
      registro: this.ddmmyyyyAIso(p.registro),
    });
    this.participantModal?.show();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const registro = this.isoADdmmyyyy(valores.registro);

    if (this.editandoId !== null) {
      this.participantesService.actualizarParticipante({
        id: this.editandoId,
        nombre: valores.nombre,
        telefono: valores.telefono,
        contacto: valores.contacto,
        estado: valores.estado,
        checkin: valores.checkin,
        registro,
      });
    } else {
      this.participantesService.agregarParticipante({
        nombre: valores.nombre,
        telefono: valores.telefono,
        contacto: valores.contacto,
        estado: valores.estado,
        checkin: valores.checkin,
        registro,
      });
      this.paginaActual = 1;
    }

    this.participantModal?.hide();
  }

  // ---------- modal eliminar ----------
  abrirModalEliminar(p: Participante): void {
    this.participanteAEliminar = p;
    this.deleteModal?.show();
  }

  confirmarEliminar(): void {
    if (this.participanteAEliminar) {
      this.participantesService.eliminarParticipante(this.participanteAEliminar.id);
      this.participanteAEliminar = null;
    }
    this.deleteModal?.hide();
  }

  // ---------- utilidades de fecha (dd/mm/yyyy <-> yyyy-mm-dd) ----------
  private hoyIso(): string {
    return new Date().toISOString().split('T')[0];
  }

  private ddmmyyyyAIso(fecha: string): string {
    const [d, m, y] = fecha.split('/');
    return `${y}-${m}-${d}`;
  }

  private isoADdmmyyyy(fecha: string): string {
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }

}
