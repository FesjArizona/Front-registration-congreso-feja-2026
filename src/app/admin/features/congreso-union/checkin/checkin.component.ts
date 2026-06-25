import { Component, OnDestroy, OnInit, AfterViewInit, inject } from '@angular/core';
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
import { RegisteredUsers } from '../../../core/models/events.service';
import { EventsService } from '../../../core/services/events.service';
import { ApiResponse } from '../../../../core/models/api-response.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';


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
export class CheckinComponent implements OnInit, OnDestroy, AfterViewInit {

  participantes: RegisteredUsers[] = [];

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
  eventId: string | null = null;

  private editModal: any;
  private deleteModal: any;
  private suscripcion?: Subscription;
  private readonly route = inject(ActivatedRoute)

  constructor(
    private participantesService: ParticipantesService,
    private fb: FormBuilder,
    private eventsService: EventsService
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
    this.route.parent?.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      this.getRegisteredUsers(this.eventId)
    });


  }

  ngAfterViewInit(): void {
    const editEl = document.getElementById('checkinEditModal');
    const deleteEl = document.getElementById('checkinDeleteModal');

    if (editEl) this.editModal = new bootstrap.Modal(editEl);
    if (deleteEl) this.deleteModal = new bootstrap.Modal(deleteEl);
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  getRegisteredUsers(eventId: any) {
    this.eventsService.getRegisteredUsers(eventId).subscribe({
      next: (response: ApiResponse<RegisteredUsers[]>) => {
        this.participantes = response.data
      },
      error: (error: HttpErrorResponse) => {
      },
      complete: () => {
      },
    })
  }

  // ---------- datos derivados (búsqueda + paginación) ----------
  get participantesFiltrados(): RegisteredUsers[] {
    return this.participantes
    // const termino = this.busqueda.trim().toLowerCase();
    // if (!termino) return this.participantes;
    // return this.participantes.filter(p =>
    //   p.nombre.toLowerCase().includes(termino) ||
    //   p.conferencia_id.toLowerCase().includes(termino) ||
    //   p.estado.toLowerCase().includes(termino) ||
    //   p.talla.toLowerCase().includes(termino)
    // );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.participantesFiltrados.length / this.porPagina));
  }

  get participantesPagina(): RegisteredUsers[] {
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
  toggleCheckin(p: RegisteredUsers): void {
    this.eventsService.checkInUser(p.id).subscribe({
      next: (response: ApiResponse<any>) => {
        this.getRegisteredUsers(this.eventId)
      },
      error: (error: HttpErrorResponse) => {
      },
      complete: () => {
      },
    })
    // const nuevoEstado: RegisteredUsers = {
    //   ...p,
    //   checkin: p.checkin === 'Completado' ? 'Pendiente' : 'Completado',
    // };
    // this.participantesService.actualizarParticipante(nuevoEstado);
  }

  // ---------- modal editar ----------
  abrirModalEditar(p: RegisteredUsers): void {
    // this.editandoId = p.id;
    // this.participanteOriginal = p;
    // this.form.setValue({
    //   nombre: p.nombre,
    //   registro: this.ddmmyyyyAIso(p.registro),
    //   conferencia: p.conferencia,
    //   camiseta: p.camiseta,
    //   talla: p.talla,
    //   comida: p.comida,
    //   checkin: p.checkin === 'Completado',
    // });
    // this.editModal?.show();
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

    // this.participantesService.actualizarParticipante({
    //   ...this.participanteOriginal,
    //   nombre: valores.nombre,
    //   registro,
    //   conferencia,
    //   estado,
    //   camiseta: valores.camiseta,
    //   talla: valores.talla,
    //   comida: valores.comida,
    //   checkin: valores.checkin ? 'Completado' : 'Pendiente',
    // });

    this.editModal?.hide();
  }

  // ---------- modal eliminar ----------
  abrirModalEliminar(p: RegisteredUsers): void {
    // this.participanteAEliminar = p;
    // this.deleteModal?.show();
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

  public isoADdmmyyyy(fecha: string | null): string {
    if (!fecha) return '';

    const dateObj = new Date(fecha);

    if (isNaN(dateObj.getTime())) return fecha;

    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();

    let resultado = `${d}/${m}/${y}`;

    if (fecha.includes('T')) {
      let horas = dateObj.getHours();
      const minutos = String(dateObj.getMinutes()).padStart(2, '0');
      const ampm = horas >= 12 ? 'PM' : 'AM';

      horas = horas % 12;
      horas = horas ? horas : 12;

      const horasStr = String(horas).padStart(2, '0');

      resultado += ` ${horasStr}:${minutos} ${ampm}`;
    }

    return resultado;
  }

}
