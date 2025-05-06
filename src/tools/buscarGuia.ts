import fetch, { Headers, RequestInit } from "node-fetch";
import FormData from "form-data";
import { COMMON_HEADERS } from "../config/headers.js";
import {
  esquemaRespuestaBusqueda,
  RespuestaBusqueda,
} from "../interface/buscarGuia.js";

/**
 * Interfaz para el contenido de la respuesta
 */
export interface ContentItem {
  type: "text";
  text: string;
}

/**
 * Interfaz para el resultado de la función buscarGuia
 */
export interface BuscarGuiaResult {
  content: ContentItem[];
  isError: boolean;
  error?: string;
}

/**
 * Busca información de un envío usando el número y código de guía
 * @param numero Número de guía o orden de envío
 * @param codigo Código alfanumérico asociado a la guía
 * @returns Objeto con la información detallada del envío
 */
export async function buscarGuiaHandler(
  numero: string,
  codigo: string,
): Promise<BuscarGuiaResult> {
  const url = "https://servicesweb.shalomcontrol.com/api/v1/web/rastrea/buscar";

  // Crear un objeto FormData para datos multipart/form-data
  const formData = new FormData();
  formData.append("numero", numero);
  formData.append("codigo", codigo);
  formData.append("ose_id", ""); // Campo opcional que se envía vacío

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
      const validatedData = esquemaRespuestaBusqueda.parse(
        responseData,
      ) as RespuestaBusqueda;

      // Formatear los datos para la respuesta
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ose_id: validatedData.data.ose_id,
                numeroOrden: validatedData.data.numero_orden,
                codigoOrden: validatedData.data.codigo_orden,
                fechaTraslado: validatedData.data.fecha_traslado,
                fechaEmision: validatedData.data.fecha_emision,
                tipoPago: validatedData.data.tipo_pago,
                estadoPago: validatedData.data.estado_pago,
                contenido: validatedData.data.contenido,
                monto: validatedData.data.monto,
                entregado: validatedData.data.entregado,
                direccionEntrega: validatedData.data.direccion_entrega,
                tiempoLlegada: validatedData.data.tiempo_llegada,
                origen: {
                  id: validatedData.data.origen.id,
                  nombre: validatedData.data.origen.nombre,
                  abreviatura: validatedData.data.origen.abrebiatura,
                  ubicacion: `${validatedData.data.origen.departamento}, ${validatedData.data.origen.provincia}, ${validatedData.data.origen.distrito}`,
                },
                destino: {
                  id: validatedData.data.destino.id,
                  nombre: validatedData.data.destino.nombre,
                  abreviatura: validatedData.data.destino.abrebiatura,
                  ubicacion: `${validatedData.data.destino.departamento}, ${validatedData.data.destino.provincia}, ${validatedData.data.destino.distrito}`,
                },
                remitente: validatedData.data.remitente,
                destinatario: validatedData.data.destinatario,
                reparto: validatedData.data.reparto,
                aereo: validatedData.data.aereo,
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
          text: `Error al buscar guía: ${error.message}`,
        },
      ],
      isError: true,
      error: error.message,
    };
  }
}
