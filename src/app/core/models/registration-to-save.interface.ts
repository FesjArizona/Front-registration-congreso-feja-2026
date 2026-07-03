export interface UserDataRegister {
    conferencia_id: number,
    talla_camiseta_id: number,
    nombre: string,
    apellidos: string,
    correo: string,
    telefono: string,
    fecha_nacimiento: string,
    genero: string,
    estado_id: number,
    ciudad: string,
    iglesia: string
    incluir_lunchtime: boolean,
    es_chaperon: boolean,
    incluir_camisa: boolean,
    alimento_especial_nota: string,
    tipo_alimento: string
    contacto_emergencia: EmergencyData
}

export interface EmergencyData {
    nombre_contacto: string
    telefono_contacto: string,
    relacion: string
}

export interface PayData {
    concepto: 'camiseta' | 'lunchtime';
    estatus_nuevo: 'pendiente' | 'pagado' | 'no_aplica';
    notas?: string;
}