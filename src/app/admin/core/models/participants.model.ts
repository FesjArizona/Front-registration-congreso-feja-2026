export type EstadoCheckin = 'Completado' | 'Pendiente';

export interface Participante {
  id: number;
  nombre: string;
  telefono: string;
  contacto: string;
  estado: string;
  checkin: EstadoCheckin;
  /** Formato dd/mm/yyyy, igual que en registrados.json */
  registro: string;
}

/** Forma usada al crear un participante nuevo (el id lo asigna el servicio) */
export type NuevoParticipante = Omit<Participante, 'id'>;
