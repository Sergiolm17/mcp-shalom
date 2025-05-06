import fetch, { Headers, RequestInit } from "node-fetch";
import FormData from "form-data";
import { COMMON_HEADERS } from "../config/headers.js";
import {
  esquemaRespuestaGuiaRemision,
  RespuestaGuiaRemision,
} from "../interface/guiaRemision.js";

/**
 * Interfaz para el contenido de la respuesta
 */
export interface ContentItem {
  type: "text";
  text: string;
}

/**
 * Interfaz para el resultado de la función obtenerGuiaRemision
 */
export interface GuiaRemisionResult {
  content: ContentItem[];
  isError: boolean;
  error?: string;
}

/**
 * Obtiene la guía de remisión transportista usando el ose_id y cap_id
 * @param ose_id ID de la orden de servicio de envío
 * @param cap_id ID del carguero/transportista
 * @returns Objeto con la información de la guía de remisión
 */
export async function obtenerGuiaRemision(
  ose_id: string,
  cap_id: string,
): Promise<GuiaRemisionResult> {
  const url = "https://servicesweb.shalomcontrol.com/api/v1/web/rastrea/grt";

  // Crear un objeto FormData para datos multipart/form-data
  const formData = new FormData();
  formData.append("ose_id", ose_id);
  formData.append("cap_id", cap_id);

  // Configurar headers específicos para esta solicitud
  const headers = new Headers({
    ...COMMON_HEADERS,
    Referer: "https://rastrea.shalom.pe/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
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
      const validatedData = esquemaRespuestaGuiaRemision.parse(
        responseData,
      ) as RespuestaGuiaRemision;

      // Formatear los datos para la respuesta
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: validatedData.success,
                mensaje: validatedData.message,
                enlace: validatedData.data.enlace,
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
          text: `Error al obtener guía de remisión: ${error.message}`,
        },
      ],
      isError: true,
      error: error.message,
    };
  }
}
