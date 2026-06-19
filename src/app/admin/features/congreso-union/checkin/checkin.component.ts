import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  CONFERENCIAS_DISPONIBLES,
  Conferencia,
  ESTADOS_PAGO_DISPONIBLES,
  ESTADO_POR_CONFERENCIA,
  EstadoPago,
  Estado,
  Participante,
  TALLAS_DISPONIBLES,
  TallaCamiseta,
} from '../../../core/models/participants.model';
import { ParticipantesService } from '../../../core/services/participants.service';

// El bundle JS de Bootstrap se carga globalmente (angular.json > scripts),
// por eso se declara así en lugar de importarlo como módulo de Angular.
declare var bootstrap: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-checkin',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss']
})
export class CheckinComponent implements OnInit, OnDestroy {

  participantes: Participante[] = [];

  conferenciasDisponibles: Conferencia[] = CONFERENCIAS_DISPONIBLES;
  tallasDisponibles: TallaCamiseta[] = TALLAS_DISPONIBLES;
  estadosPagoDisponibles: EstadoPago[] = ESTADOS_PAGO_DISPONIBLES;

  private readonly avatarPalette: string[] = [
    '#F2994A', '#2D9CDB', '#9B51E0', '#EB5757', '#F2C94C',
    '#27AE60', '#5B6FE0', '#EE6C9B', '#56C2C0', '#BB6BD9'
  ];

  // ---------- búsqueda ----------
  busqueda = '';

  // ---------- paginación ----------
  paginaActual = 1;
  porPagina = 5;
  opcionesPorPagina = [5, 10, 20, 50, 100];

  // ---------- formulario del modal ----------
  form: FormGroup;
  editandoId: number | null = null;
  /** Participante completo que se está editando, para no perder campos que este formulario no expone (teléfono) */
  private participanteOriginal: Participante | null = null;
  participanteAEliminar: Participante | null = null;

  private editModal: any;
  private deleteModal: any;
  private suscripcion?: Subscription;

  constructor(
    private participantesService: ParticipantesService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      registro: ['', Validators.required],
      conferencia: ['', Validators.required],
      camiseta: ['Pendiente', Validators.required],
      talla: ['MD', Validators.required],
      comida: ['Pendiente', Validators.required],
      checkin: [false],
    });
  }

  ngOnInit(): void {
    this.suscripcion = this.participantesService.getParticipantes().subscribe(data => {
      this.participantes = data;
      if (this.paginaActual > this.totalPaginas) {
        this.paginaActual = this.totalPaginas;
      }
    });

    const editEl = document.getElementById('checkinEditModal');
    const deleteEl = document.getElementById('checkinDeleteModal');
    if (editEl) this.editModal = new bootstrap.Modal(editEl);
    if (deleteEl) this.deleteModal = new bootstrap.Modal(deleteEl);
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  // ---------- datos derivados (búsqueda + paginación) ----------
  get participantesFiltrados(): Participante[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.participantes;
    return this.participantes.filter(p =>
      p.nombre.toLowerCase().includes(termino) ||
      p.conferencia.toLowerCase().includes(termino) ||
      p.estado.toLowerCase().includes(termino) ||
      p.talla.toLowerCase().includes(termino)
    );
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

  // ---------- check-in directo desde la tabla ----------
  toggleCheckin(p: Participante): void {
    const nuevoEstado: Participante = {
      ...p,
      checkin: p.checkin === 'Completado' ? 'Pendiente' : 'Completado',
    };
    this.participantesService.actualizarParticipante(nuevoEstado);
  }

  // ---------- modal editar ----------
  abrirModalEditar(p: Participante): void {
    this.editandoId = p.id;
    this.participanteOriginal = p;
    this.form.setValue({
      nombre: p.nombre,
      registro: this.ddmmyyyyAIso(p.registro),
      conferencia: p.conferencia,
      camiseta: p.camiseta,
      talla: p.talla,
      comida: p.comida,
      checkin: p.checkin === 'Completado',
    });
    this.editModal?.show();
  }

  /** Estado derivado en vivo, según la conferencia seleccionada en el formulario (solo lectura en el modal) */
  get estadoCalculado(): Estado | '' {
    const conferencia = this.form.get('conferencia')?.value as Conferencia | '';
    return conferencia ? ESTADO_POR_CONFERENCIA[conferencia] : '';
  }

  guardar(): void {
    if (this.form.invalid || !this.participanteOriginal) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const registro = this.isoADdmmyyyy(valores.registro);
    const conferencia: Conferencia = valores.conferencia;
    const estado = ESTADO_POR_CONFERENCIA[conferencia];

    this.participantesService.actualizarParticipante({
      ...this.participanteOriginal,
      nombre: valores.nombre,
      registro,
      conferencia,
      estado,
      camiseta: valores.camiseta,
      talla: valores.talla,
      comida: valores.comida,
      checkin: valores.checkin ? 'Completado' : 'Pendiente',
    });

    this.editModal?.hide();
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
  private ddmmyyyyAIso(fecha: string): string {
    const [d, m, y] = fecha.split('/');
    return `${y}-${m}-${d}`;
  }

  private isoADdmmyyyy(fecha: string): string {
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }

}
