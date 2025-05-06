import { z } from "zod";

/**
 * Esquema para la respuesta de la API de guía de remisión
 * Esta API devuelve un enlace a la guía de remisión transportista
 */
const esquemaDatosGuiaRemision = z.object({
  enlace: z.string(),
});

// Esquema para la respuesta completa de la API
export const esquemaRespuestaGuiaRemision = z.object({
  success: z.boolean(),
  message: z.string(),
  data: esquemaDatosGuiaRemision,
});

// Tipos inferidos para uso en TypeScript
export type DatosGuiaRemision = z.infer<typeof esquemaDatosGuiaRemision>;
export type RespuestaGuiaRemision = z.infer<
  typeof esquemaRespuestaGuiaRemision
>;

/**
 * Ejemplo de uso:
 *
 * ```typescript
 * import { esquemaRespuestaGuiaRemision, RespuestaGuiaRemision } from '../interface/guiaRemision.js';
 *
 * // Validar respuesta de API
 * const respuestaAPI = await fetch(url).then(res => res.json());
 * try {
 *   const datosValidados = esquemaRespuestaGuiaRemision.parse(respuestaAPI);
 *   // Usar datosValidados con seguridad de tipos
 * } catch (error) {
 *   console.error("Error de validación:", error);
 * }
 * ```
 */
