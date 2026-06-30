import { Component, OnDestroy, OnInit, AfterViewInit, inject, signal } from '@angular/core';
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
import { RegisteredUsers } from '../../../core/models/events.model';
import { EventsService } from '../../../core/services/events.service';
import { ApiResponse } from '../../../../core/models/api-response.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Conferences, Sizes, States } from '../../../../core/models/general.interface';


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
  states = signal<States[]>([]);
  conferences = signal<Conferences[]>([]);
  cities = signal<string[]>([]);
  sizes = signal<Sizes[]>([]);
  // ---------- paginación ----------
  paginaActual = 1;
  porPagina = 5;
  opcionesPorPagina = [5, 10, 20, 50, 100];

  // ---------- formulario del modal ----------
  form: FormGroup;
  editandoId: number | null = null;
  /** Participante completo que se está editando, para no perder campos que este formulario no expone (teléfono) */
  private participanteOriginal: RegisteredUsers | null = null;
  participanteAEliminar: RegisteredUsers | null = null;
  eventId: string | null = null;

  private editModal: any;
  private deleteModal: any;
  private suscripcion?: Subscription;
  private readonly route = inject(ActivatedRoute)
  private readonly apiService = inject(ApiService)

  constructor(
    private participantesService: ParticipantesService,
    private fb: FormBuilder,
    private eventsService: EventsService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      registro: ['', Validators.required],
      estado: ['', Validators.required],
      conferencia: ['', Validators.required],
      ciudad: ['', Validators.required],
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

  getStates() {
    this.apiService.getStates().subscribe({
      next: (response: ApiResponse<States[]>) => {
        this.states.set(response.data);
        const currentStateId = this.form.get('estado')?.value;
        if (currentStateId) {
          this.loadConferencesAndCities(currentStateId);
        }
      },
      error: (error: HttpErrorResponse) => { },
    });
  }

  loadConferencesAndCities(stateId: string | number) {
    if (!stateId) return;

    const parsedId = typeof stateId === 'string' ? parseInt(stateId) : stateId;

    const state = this.states().find(s => s.id === parsedId);
    console.log(stateId)
    if (state != undefined) {

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


  ngAfterViewInit(): void {
    const editEl = document.getElementById('checkinEditModal');
    const deleteEl = document.getElementById('checkinDeleteModal');

    if (editEl) this.editModal = new bootstrap.Modal(editEl);
    if (deleteEl) this.deleteModal = new bootstrap.Modal(deleteEl);
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
    this.editModal?.dispose();
    this.deleteModal?.dispose();
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
  cerrarModalEditar(): void {
    this.editModal?.hide();
  }

  cerrarModalEliminar(): void {
    this.deleteModal?.hide();
    this.participanteAEliminar = null; // Buena práctica limpiar el estado
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
    this.editandoId = p.id;
    this.participanteOriginal = p;
    console.log(p.conferencia)
    console.log(p.estado_id)
    console.log(p.ciudad)
    this.form.setValue({
      nombre: p.nombre,
      apellido: p.apellidos,
      registro: this.ddmmyyyyAIso(p.created_at),
      estado: p.estado_id,
      conferencia: p.conferencia_id,
      ciudad: p.ciudad,
      camiseta: p.pago_camiseta,
      talla: p.talla_camiseta_id,
      comida: p.pago_lunchtime,
      checkin: p.checkin_at != null,
    });
    this.editModal?.show();
    this.getStates()
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

  private ddmmyyyyAIso(fecha: string): string {
    if (!fecha) return '';

    if (fecha.includes('T')) {
      return fecha.split('T')[0];
    }

    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return '';

    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');

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
