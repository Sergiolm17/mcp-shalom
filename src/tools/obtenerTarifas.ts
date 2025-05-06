import fetch, { Headers, RequestInit } from "node-fetch";
import FormData from "form-data";
import { COMMON_HEADERS } from "../config/headers.js";
import {
  RespuestaTarifas,
  esquemaRespuestaTarifas,
} from "../interface/obtenerTarifas.js";

/**
 * Interfaz para el contenido de la respuesta
 */
export interface ContentItem {
  type: "text";
  text: string;
}

/**
 * Interfaz para el resultado de la función obtenerTarifas
 */
export interface ObtenerTarifasResult {
  content: ContentItem[];
  isError: boolean;
}

/**
 * Obtiene las tarifas entre dos agencias utilizando sus ID's
 * @param origen ID de la agencia de origen
 * @param destino ID de la agencia de destino
 * @returns Objeto con la información de tarifas
 */
export async function obtenerTarifasHandler(
  origen: number,
  destino: number,
): Promise<ObtenerTarifasResult> {
  const url = "https://servicesweb.shalomcontrol.com/api/v1/web/tarifa/mostrar";

  // Crear un objeto FormData para datos multipart/form-data
  const formData = new FormData();
  formData.append("origin", origen);
  formData.append("destiny", destino);

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
      const validatedData = esquemaRespuestaTarifas.parse(
        responseData,
      ) as RespuestaTarifas;
      console.log("Tarifas obtenidas y validadas correctamente");

      // Devolver los datos formateados
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                tiempoEntrega: validatedData.data.lead_time,
                tarifas: {
                  paqueteXXS: validatedData.data.tariff.cajapaquetexxs,
                  paqueteXS: validatedData.data.tariff.cajapaquetexs,
                  paqueteS: validatedData.data.tariff.cajapaquetes,
                  paqueteM: validatedData.data.tariff.cajapaquetem,
                  paqueteL: validatedData.data.tariff.cajapaquetel,
                },
              },
              null,
              2,
            ),
          },
        ],
        isError: !validatedData.success,
      };
    } catch (validationError) {
      console.error("Error al validar datos de tarifas:", validationError);
      // En caso de error de validación, devolvemos la respuesta original
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                mensaje:
                  "Tarifas disponibles entre las agencias seleccionadas.",
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
    console.error("Error al obtener tarifas:", error);
    return {
      content: [
        { type: "text", text: `Error al obtener tarifas: ${error.message}` },
      ],
      isError: true,
    };
  }
}
