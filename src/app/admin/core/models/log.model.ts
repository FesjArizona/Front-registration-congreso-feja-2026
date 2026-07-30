export type LogAccion = 'UPDATE_REGISTER' | 'DELETE_REGISTER' | 'CHECK_IN' | 'CREATE_REGISTER';

export interface AdminLog {
  id: number;
  admin: string;
  accion: LogAccion;
  registro_afectado: string; // ej: 'id_14'
  detalles: string | null;   // texto tipo JSON o null
  fecha_hora: string;        // ISO string
}
