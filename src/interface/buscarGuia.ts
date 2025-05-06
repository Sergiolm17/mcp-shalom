import { z } from "zod";

// Esquema para la información de origen y destino
const esquemaTerminal = z.object({
  id: z.number(),
  nombre: z.string(),
  abrebiatura: z.string(),
  ubigeo: z.number(),
  departamento: z.string(),
  provincia: z.string(),
  distrito: z.string(),
});

// Esquema para remitente y destinatario
const esquemaPersona = z.object({
  documento: z.string(),
  nombre: z.string(),
});

// Esquema para el comprobante
const esquemaComprobante = z.object({
  cop_id: z.number(),
  serie: z.string(),
  numero: z.string(),
  tipo: z.string(),
  tipo_pago: z.string(),
  estado_pago: z.string(),
  fecha: z.string(),
  hora: z.string(),
});

// Esquema para los datos de la guía encontrada
const esquemaDatosGuia = z.object({
  ose_id: z.number(),
  numero_orden: z.string(),
  codigo_orden: z.string(),
  fecha_traslado: z.string(),
  fecha_emision: z.string(),
  tipo_pago: z.string(),
  estado_pago: z.string(),
  contenido: z.string(),
  monto: z.string(),
  entregado: z.boolean(),
  direccion_entrega: z.string(),
  tiempo_llegada: z.string(),
  origen: esquemaTerminal,
  destino: esquemaTerminal,
  remitente: esquemaPersona,
  destinatario: esquemaPersona,
  comprobante: esquemaComprobante,
  reparto: z.boolean(),
  montoAdicional: z.number(),
  aereo: z.boolean(),
});

// Esquema para la respuesta completa de la API de búsqueda
export const esquemaRespuestaBusqueda = z.object({
  success: z.boolean(),
  message: z.string(),
  data: esquemaDatosGuia,
});

// Tipos inferidos para uso en TypeScript
export type Terminal = z.infer<typeof esquemaTerminal>;
export type Persona = z.infer<typeof esquemaPersona>;
export type Comprobante = z.infer<typeof esquemaComprobante>;
export type DatosGuia = z.infer<typeof esquemaDatosGuia>;
export type RespuestaBusqueda = z.infer<typeof esquemaRespuestaBusqueda>;

/**
 * Ejemplo de uso:
 *
 * ```typescript
 * import { esquemaRespuestaBusqueda, RespuestaBusqueda } from '../interface/buscarGuia.js';
 *
 * // Validar respuesta de API
 * const respuestaAPI = await fetch(url).then(res => res.json());
 * try {
 *   const datosValidados = esquemaRespuestaBusqueda.parse(respuestaAPI);
 *   // Usar datosValidados con seguridad de tipos
 * } catch (error) {
 *   console.error("Error de validación:", error);
 * }
 * ```
 */
