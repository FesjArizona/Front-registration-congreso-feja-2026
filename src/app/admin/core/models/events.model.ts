export interface RegisteredUsers {
    id: number,
    evento_id: number,
    conferencia: string,
    conferencia_id: number
    talla: number,
    talla_camiseta_id: number
    nombre: string,
    apellidos: string,
    correo: string,
    telefono: string,
    fecha_nacimiento: string,
    genero: string,
    estado: string,
    estado_id: number
    ciudad: string,
    iglesia: string,
    incluir_lunchtime: number,
    es_chaperon: number,
    pago_camiseta: string,
    pago_lunchtime: string,
    checkin_at: string | null,
    created_at: string,
    updated_at: string
}
