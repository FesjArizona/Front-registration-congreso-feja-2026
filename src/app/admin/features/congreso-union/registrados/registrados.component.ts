import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Conferencia, Estado, ESTADOS_DISPONIBLES, Participante } from '../../../core/models/participants.model';
import { ParticipantesService } from '../../../core/services/participants.service';
import { RegisteredUsers } from '../../../core/models/events.model';
import { EventsService } from './../../../../admin/core/services/events.service';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '../../../../core/models/api-response.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Conferences, Sizes, States } from '../../../../core/models/general.interface';
import { ApiService } from '../../../../core/services/api.service';


declare var bootstrap: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-registrados',
  templateUrl: './registrados.component.html',
  styleUrls: ['./registrados.component.scss']
})
export class RegistradosComponent implements OnInit, OnDestroy {

  participantes: RegisteredUsers[] = [];

  conferenciasDisponibles: Conferencia[] = ['Arizona Conference',
    'Central California Conference',
    'Hawaii Conference',
    'Nevada-Utah Conference',
    'Northern California Conference',
    'Southeastern California Conference',
    'Southern California Conference'];
  estadosDisponibles: Estado[] = ESTADOS_DISPONIBLES;

  private readonly avatarPalette: string[] = [
    '#F2994A', '#2D9CDB', '#9B51E0', '#EB5757', '#F2C94C',
    '#27AE60', '#5B6FE0', '#EE6C9B', '#56C2C0', '#BB6BD9'
  ];

  // ---------- estado de carga ----------
  cargando = true;
  skeletonRows = Array.from({ length: 5 });

  // ---------- filtros ----------
  busqueda = '';
  filtroEstado = '';
  filtroConferencia = '';
  filtroCheckin = '';


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
  /** Participante completo que se está editando, para no perder campos que este formulario no expone (camiseta, talla, comida) */
  private participanteOriginal: RegisteredUsers | null = null;
  participanteAEliminar: RegisteredUsers | null = null;
  eventId: string | null = null;

  private participantModal: any;
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
      apellidos: ['', Validators.required],
      registro: ['', Validators.required],
      estado_id: ['', Validators.required],
      conferencia_id: ['', Validators.required],
      ciudad: ['', Validators.required],
      pago_camiseta: ['Pendiente', Validators.required],
      tipo_alimento: ['', Validators.required],
      talla_camiseta_id: ['MD', Validators.required],
      pago_lunchtime: ['Pendiente', Validators.required],
      checkin_at: [false],
    });
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      this.getRegisteredUsers(this.eventId)
    });

    const modalEl = document.getElementById('participantModal');
    const deleteEl = document.getElementById('deleteModal');
    if (modalEl) this.participantModal = new bootstrap.Modal(modalEl);
    if (deleteEl) this.deleteModal = new bootstrap.Modal(deleteEl);

    this.addStateEvent()
  }

  addStateEvent() {
    this.form.get('estado_id')?.valueChanges.subscribe((stateId) => {
      this.form.get('ciudad')?.setValue('')
      this.loadConferencesAndCities(stateId);
    });
  }

  getRegisteredUsers(eventId: any) {
    this.cargando = true;
    this.eventsService.getRegisteredUsers(eventId).subscribe({
      next: (response: ApiResponse<RegisteredUsers[]>) => {
        this.participantes = response.data
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      },
    })
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  // ---------- datos derivados (filtros + paginación) ----------
  get participantesFiltrados(): RegisteredUsers[] {
    const termino = this.busqueda.trim().toLowerCase();
    return this.participantes.filter(p => {
      const coincideBusqueda = !termino ||
        p.nombre.toLowerCase().includes(termino) ||
        p.telefono.includes(termino) ||
        p.correo.includes(termino);
      const coincideConferencia = !this.filtroConferencia || p.conferencia === this.filtroConferencia;
      let coincideCheckin = true;
      if (this.filtroCheckin === "Pendiente") {
        coincideCheckin = !p.checkin_at;
      } else if (this.filtroCheckin === "Completado") {
        coincideCheckin = !!p.checkin_at;
      }
      return coincideBusqueda && coincideConferencia && coincideCheckin;
    });
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
  onFiltroChange(): void { this.paginaActual = 1; }

  onPorPaginaChange(): void {
    this.paginaActual = 1;
    this.skeletonRows = Array.from({ length: this.porPagina });
  }

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

  getStates() {
    this.apiService.getStates().subscribe({
      next: (response: ApiResponse<States[]>) => {
        this.states.set(response.data);
        const currentStateId = this.form.get('estado_id')?.value;
        if (currentStateId) {
          this.loadConferencesAndCities(currentStateId);
        }
      },
      error: (error: HttpErrorResponse) => { },
    });
  }
  getSizes() {
    this.apiService.getSizes().subscribe({
      next: (response: ApiResponse<Sizes[]>) => {
        this.sizes.set(response.data);
      },
      error: (error: HttpErrorResponse) => { },
    });
  }


  loadConferencesAndCities(stateId: string | number) {
    if (!stateId) return;

    const parsedId = typeof stateId === 'string' ? parseInt(stateId) : stateId;

    const state = this.states().find(s => s.id === parsedId);
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

  // ---------- modal crear / editar ----------
  abrirModalNuevo(): void {
    this.editandoId = null;
    this.participanteOriginal = null;
    this.form.reset({
      nombre: '',
      telefono: '',
      conferencia: '',
      checkin: 'Pendiente',
      registro: this.hoyIso(),
    });
    this.participantModal?.show();
  }

  abrirModalEditar(p: RegisteredUsers): void {
    this.editandoId = p.id;
    this.participanteOriginal = p;
    this.form.setValue({
      nombre: p.nombre,
      apellidos: p.apellidos,
      registro: this.ddmmyyyyAIso(p.created_at),
      estado_id: p.estado_id,
      conferencia_id: p.conferencia_id,
      ciudad: p.ciudad,
      pago_camiseta: p.pago_camiseta,
      tipo_alimento: p.tipo_alimento,
      talla_camiseta_id: p.talla_camiseta_id,
      pago_lunchtime: p.pago_lunchtime,
      checkin_at: p.checkin_at != null,
    });
    this.participantModal?.show();
    this.getStates()
    this.getSizes()
  }



  guardar(): void {
    if (this.form.invalid || !this.participanteOriginal) {
      this.form.markAllAsTouched();
      return;
    }
    const payloadActualizado: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);

      if (control && control.dirty) {
        payloadActualizado[key] = control.value;
      }
    });

    if (Object.keys(payloadActualizado).length === 0) {
      this.participantModal?.hide();
      return;
    }
    this.eventsService.updateRegister(payloadActualizado, this.participanteOriginal.id).subscribe({
      next: (response: ApiResponse<any>) => {
        this.getRegisteredUsers(this.eventId)
      },
      error: (error: HttpErrorResponse) => {
      },
      complete: () => {
      },
    })

    this.participantModal?.hide();
  }

  // ---------- modal eliminar ----------
  abrirModalEliminar(p: RegisteredUsers): void {
    this.participanteAEliminar = p;
    this.deleteModal?.show();
  }

  confirmarEliminar(): void {
    if (this.participanteAEliminar) {
      this.eventsService.removeRegister(this.participanteAEliminar.id).subscribe({
        next: (response: ApiResponse<RegisteredUsers[]>) => {
          this.getRegisteredUsers(this.eventId)
        },
        error: (error: HttpErrorResponse) => {
        },
        complete: () => {
        },
      })
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

  public isoADdmmyyyy(fecha: string | null): string {
    if (!fecha) return '';

    const dateObj = new Date(fecha);

    if (isNaN(dateObj.getTime())) return fecha;

    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();

    let resultado = `${d}/${m}/${y}`;

    /* if (fecha.includes('T')) {
      let horas = dateObj.getHours();
      const minutos = String(dateObj.getMinutes()).padStart(2, '0');
      const ampm = horas >= 12 ? 'PM' : 'AM';

      horas = horas % 12;
      horas = horas ? horas : 12;

      const horasStr = String(horas).padStart(2, '0');

      resultado += ` ${horasStr}:${minutos} ${ampm}`;
    } */

    return resultado;
  }


}
