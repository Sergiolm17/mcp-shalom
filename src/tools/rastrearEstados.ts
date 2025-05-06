import fetch, { Headers, RequestInit } from "node-fetch";
import FormData from "form-data";
import { COMMON_HEADERS } from "../config/headers.js";
import {
  esquemaRespuestaRastreo,
  RespuestaRastreo,
} from "../interface/rastrearEstados.js";

/**
 * Interfaz para el contenido de la respuesta
 */
export interface ContentItem {
  type: "text";
  text: string;
}

/**
 * Interfaz para el resultado de la función rastrearEstados
 */
export interface RastrearEstadosResult {
  content: ContentItem[];
  isError: boolean;
  error?: string;
}

/**
 * Rastrea los estados de un envío usando el número de orden de servicio (OSE_ID)
 * @param ose_id Número de orden de servicio a rastrear
 * @returns Objeto con la información del rastreo del envío
 */
export async function rastrearEstados(
  ose_id: string,
): Promise<RastrearEstadosResult> {
  const url =
    "https://servicesweb.shalomcontrol.com/api/v1/web/rastrea/estados";

  // Crear un objeto FormData para datos multipart/form-data
  const formData = new FormData();
  formData.append("ose_id", ose_id);

  // Configurar headers específicos para esta solicitud
  const headers = new Headers({
    ...COMMON_HEADERS,
  });

  // Opciones para la petición
  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: formData,
  };

  try {
    // Realizar la petición
    const response = await fetch(url, requestOptions);

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    // Parsear la respuesta JSON
    const responseData = await response.json();

    // Validar la respuesta usando el esquema Zod
    try {
      const validatedData = esquemaRespuestaRastreo.parse(
        responseData,
      ) as RespuestaRastreo;

      // Determinar el estado actual del envío
      let estadoActual = "En preparación";
      if (validatedData.data.entregado) {
        estadoActual = "Entregado";
      } else if (validatedData.data.reparto) {
        estadoActual = "En reparto";
      } else if (validatedData.data.destino.completo) {
        estadoActual = "En destino";
      } else if (validatedData.data.transito.completo) {
        estadoActual = "En tránsito";
      } else if (validatedData.data.origen) {
        estadoActual = "En origen";
      }

      // Crear un array con todas las etapas del envío en orden cronológico
      const etapas = [];

      // Agregar etapa "Registrado"
      if (validatedData.data.registrado) {
        etapas.push({
          etapa: "Registrado",
          fecha: validatedData.data.registrado.fecha,
          completado: true,
        });
      }

      // Agregar etapa "En origen"
      if (validatedData.data.origen) {
        etapas.push({
          etapa: "En origen",
          fecha: validatedData.data.origen.fecha,
          completado: true,
        });
      }

      // Agregar etapa "En tránsito"
      if (validatedData.data.transito) {
        etapas.push({
          etapa: "En tránsito",
          fecha: validatedData.data.transito.fecha,
          completado: validatedData.data.transito.completo || false,
          carguero: validatedData.data.transito.carguero,
          cargueros: validatedData.data.transito.cargueros,
        });
      }

      // Agregar etapa "En destino"
      if (validatedData.data.destino) {
        etapas.push({
          etapa: "En destino",
          fecha: validatedData.data.destino.fecha,
          completado: validatedData.data.destino.completo || false,
        });
      }

      // Agregar etapa "En reparto" si existe
      if (validatedData.data.reparto) {
        etapas.push({
          etapa: "En reparto",
          fecha: validatedData.data.reparto.fecha,
          completado: validatedData.data.reparto.completo || false,
        });
      }

      // Agregar etapa "Entregado" si existe
      if (validatedData.data.entregado) {
        etapas.push({
          etapa: "Entregado",
          fecha: validatedData.data.entregado.fecha,
          completado: true,
        });
      }

      // Formatear los datos para la respuesta
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: validatedData.success,
                mensaje: validatedData.message,
                ose_id: ose_id,
                estadoActual: estadoActual,
                etapas: etapas,
                datosDemora: validatedData.data.demora,
                datosCompletos: validatedData.data,
              },
              null,
              2,
            ),
          },
        ],
        isError: !validatedData.success,
      };
    } catch (validationError) {
      // En caso de error de validación, devolvemos la respuesta original
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                mensaje: "Error al validar la respuesta de la API",
                datos: responseData,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error al rastrear estados: ${error.message}`,
        },
      ],
      isError: true,
      error: error.message,
    };
  }
}
