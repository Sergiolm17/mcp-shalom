import { z } from "zod";

// Esquema para la información de conexión
const esquemaConexion = z.object({
  min_peso: z.number(),
  min_volumen: z.number(),
  min_precio: z.number(),
  min_paq_jr: z.number(),
  min_paqueteria: z.number(),
  min_paquetexs: z.number(),
  min_paquetexxs: z.number(),
  min_sobre: z.number(),
});

// Esquema para la información detallada de la tarifa
const esquemaDatosTarifa = z.object({
  tar_anotacion: z.string(),
  tar_antivuelcos: z.string(),
  tar_base: z.string(),
  tar_densidadbase: z.string(),
  tar_igv: z.string(),
  tar_jaulas: z.string(),
  tar_minimopeso: z.string(),
  tar_minimovolumen: z.string(),
  tar_paqueteria: z.string(),
  tar_paqueteriamin: z.string(),
  tar_planchas: z.string(),
  tar_preminimo: z.string(),
  tar_presobre: z.string(),
  tar_paquetexxs: z.string(),
  Paquetito: z.string(),
  tar_tolvas: z.string(),
  distancia: z.number(),
  origen: z.number(),
  destino: z.number(),
  tar_urldoc: z.null(),
  tar_tiempo_llegada: z.number(),
  tar_ovz: z.string(),
  tar_hea: z.string(),
  conexion: esquemaConexion,
  lead_time: z.string(),
});

// Esquema para la información de tarifas
const esquemaTarifa = z.object({
  peso: z.number(),
  volumen: z.number(),
  sobre: z.number(),
  cajapaquetexxs: z.number(),
  cajapaquetexs: z.number(),
  cajapaquetes: z.number(),
  cajapaquetem: z.number(),
  cajapaquetel: z.number(),
  ovz: z.number(),
  hea: z.number(),
});

// Esquema para los datos de respuesta
const esquemaData = z.object({
  price: z.number(),
  tariff: esquemaTarifa,
  data_tarifa: esquemaDatosTarifa,
  lead_time: z.string(),
  message: z.string(),
  type: z.string(),
});

// Esquema para la respuesta completa de la API de tarifas
export const esquemaRespuestaTarifas = z.object({
  success: z.boolean(),
  message: z.string(),
  data: esquemaData,
});

// --- Tipos inferidos para uso en TypeScript ---

export type Conexion = z.infer<typeof esquemaConexion>;
export type DatosTarifa = z.infer<typeof esquemaDatosTarifa>;
export type Tarifa = z.infer<typeof esquemaTarifa>;
export type DataTarifas = z.infer<typeof esquemaData>;
export type RespuestaTarifas = z.infer<typeof esquemaRespuestaTarifas>;

/**
 * Ejemplo de uso:
 *
 * ```typescript
 * import { esquemaRespuestaTarifas, RespuestaTarifas } from '../interface/obtenerTarifas.js';
 *
 * // Validar respuesta de API
 * const respuestaAPI = await fetch(url).then(res => res.json());
 * try {
 *   const tarifasValidadas = esquemaRespuestaTarifas.parse(respuestaAPI);
 *   // Usar tarifasValidadas con seguridad de tipos
 * } catch (error) {
 *   console.error("Error de validación:", error);
 * }
 *
 * // O utilizar el tipo directamente
 * function procesarTarifas(tarifas: RespuestaTarifas) {
 *   console.log(`Precio: ${tarifas.data.price}`);
 *   console.log(`Tiempo de entrega: ${tarifas.data.lead_time}`);
 * }
 * ```
 */
