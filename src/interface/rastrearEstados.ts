import { z } from "zod";

// Esquema para etapa base con solo fecha
const esquemaEtapaBase = z.object({
  fecha: z.string(),
});

// Esquema para etapas con información adicional de completitud
const esquemaEtapaCompleta = esquemaEtapaBase.extend({
  completo: z.boolean().optional(),
});

// Esquema específico para la etapa de tránsito
const esquemaEtapaTransito = esquemaEtapaCompleta.extend({
  cargueros: z.array(z.string()).optional(),
  carguero: z.string().optional(),
});

// Esquema para la respuesta del seguimiento completo
const esquemaSeguimientoEnvio = z.object({
  registrado: esquemaEtapaBase,
  origen: esquemaEtapaBase,
  transito: esquemaEtapaTransito,
  destino: esquemaEtapaCompleta,
  entregado: z.any().nullable(), // Puede ser null o un objeto con datos de entrega
  reparto: z.any().nullable(), // Puede ser null o un objeto con datos de reparto
  demora: z.any().nullable(), // Puede ser null o un objeto con datos de demora
});

// Esquema para la respuesta completa de la API de rastreo
export const esquemaRespuestaRastreo = z.object({
  success: z.boolean(),
  message: z.string(),
  data: esquemaSeguimientoEnvio,
});

// Tipos inferidos para uso en TypeScript
export type EtapaBase = z.infer<typeof esquemaEtapaBase>;
export type EtapaCompleta = z.infer<typeof esquemaEtapaCompleta>;
export type EtapaTransito = z.infer<typeof esquemaEtapaTransito>;
export type SeguimientoEnvio = z.infer<typeof esquemaSeguimientoEnvio>;
export type RespuestaRastreo = z.infer<typeof esquemaRespuestaRastreo>;

/**
 * Ejemplo de uso:
 *
 * ```typescript
 * import { esquemaRespuestaRastreo, RespuestaRastreo } from '../interface/rastrearEstados.js';
 *
 * // Validar respuesta de API
 * const respuestaAPI = await fetch(url).then(res => res.json());
 * try {
 *   const datosValidados = esquemaRespuestaRastreo.parse(respuestaAPI);
 *   // Usar datosValidados con seguridad de tipos
 * } catch (error) {
 *   console.error("Error de validación:", error);
 * }
 * ```
 */
