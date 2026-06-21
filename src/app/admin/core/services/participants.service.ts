import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { NuevoParticipante, Participante } from './../models/participants.model';

@Injectable({ providedIn: 'root' })
export class ParticipantesService {

  /** Ruta del archivo estático dentro de assets */
  private readonly jsonUrl = 'assets/data/registered.json';

  /** Cache en memoria de los participantes ya cargados */
  private readonly participantesSubject = new BehaviorSubject<Participante[]>([]);

  /** Evita volver a pedir el archivo si ya fue cargado */
  private cargado = false;

  constructor(private http: HttpClient) {}

  /**
   * Devuelve un observable con la lista de participantes.
   * La primera vez dispara la petición HTTP al JSON de assets;
   * las siguientes veces reutiliza la copia ya cargada en memoria.
   */
  getParticipantes(): Observable<Participante[]> {
    if (!this.cargado) {
      this.cargado = true;
      this.http.get<Participante[]>(this.jsonUrl).pipe(
        tap(data => this.participantesSubject.next(data))
      ).subscribe({
        error: () => {
          // Si falla la carga, permite reintentar en la próxima llamada
          this.cargado = false;
        }
      });
    }
    return this.participantesSubject.asObservable();
  }

  /** Agrega un participante nuevo al frente de la lista (solo en memoria) */
  agregarParticipante(participante: NuevoParticipante): void {
    const actuales = this.participantesSubject.value;
    const nuevoId = actuales.length ? Math.max(...actuales.map(p => p.id)) + 1 : 1;
    const nuevo: Participante = { id: nuevoId, ...participante };
    this.participantesSubject.next([nuevo, ...actuales]);
  }

  /** Actualiza un participante existente (solo en memoria) */
  actualizarParticipante(participante: Participante): void {
    const actualizados = this.participantesSubject.value.map(p =>
      p.id === participante.id ? { ...participante } : p
    );
    this.participantesSubject.next(actualizados);
  }

  /** Elimina un participante por id (solo en memoria) */
  eliminarParticipante(id: number): void {
    const filtrados = this.participantesSubject.value.filter(p => p.id !== id);
    this.participantesSubject.next(filtrados);
  }
}
