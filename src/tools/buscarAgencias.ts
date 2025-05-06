import fetch, { Headers, RequestInit } from "node-fetch";
import { COMMON_HEADERS } from "../config/headers.js";
import { RespuestaApi } from "../interface/ListaDeAgencias.js";
import { normalizarTexto } from "../utils/text.js";

/**
 * Interfaz para el contenido de la respuesta
 */
export interface ContentItem {
  type: "text";
  text: string;
}

/**
 * Interfaz para el resultado de la función buscarAgencias
 */
export interface BuscarAgenciasResult {
  content: ContentItem[];
  isError?: boolean;
}

/**
 * Busca agencias filtrando por departamento, provincia y/o distrito de manera jerárquica.
 * Es obligatorio proporcionar al menos uno de los criterios de búsqueda.
 */
export async function buscarAgencias({
  provincia,
  departamento,
  distrito,
  datosSolicitados,
}: {
  departamento?: string;
  provincia?: string;
  distrito?: string;
  datosSolicitados: Array<"lat-long" | "horario" | "estado-de-agencia">;
}): Promise<BuscarAgenciasResult> {
  if (!provincia && !departamento && !distrito) {
    throw new Error(
      "Se debe proporcionar al menos un criterio de búsqueda: departamento, provincia o distrito.",
    );
  }

  const url =
    "https://servicesweb.shalomcontrol.com/api/v1/web/agencias/listar";
  const headers = new Headers({
    ...COMMON_HEADERS,
    Referer: "https://rastrea.shalom.pe/",
  });
  const requestOptions: RequestInit = { method: "GET", headers: headers };

  try {
    const response = await fetch(url, requestOptions);
    const responseJson = (await response.json()) as RespuestaApi;

    if (!responseJson.success) {
      return {
        content: [{ type: "text", text: `Error: ${responseJson.message}` }],
        isError: true,
      };
    }

    // Normalizar términos de búsqueda
    const departamentoNormalizado = departamento
      ? normalizarTexto(departamento)
      : "";
    const provinciaNormalizada = provincia ? normalizarTexto(provincia) : "";
    const distritoNormalizado = distrito ? normalizarTexto(distrito) : "";

    // Aplicar filtrado jerárquico: primero departamento, luego provincia, finalmente distrito
    let agenciasFiltradas = responseJson.data;

    // Paso 1: Filtrar por departamento si está presente
    if (departamento) {
      agenciasFiltradas = agenciasFiltradas.filter((agencia) =>
        normalizarTexto(agencia.departamento).includes(departamentoNormalizado),
      );
    }

    // Paso 2: Filtrar por provincia si está presente
    if (provincia) {
      agenciasFiltradas = agenciasFiltradas.filter((agencia) =>
        normalizarTexto(agencia.provincia).includes(provinciaNormalizada),
      );
    }

    // Paso 3: Filtrar por distrito si está presente
    if (distrito) {
      // Filtrando por el campo "lugar" que contiene información del distrito
      agenciasFiltradas = agenciasFiltradas.filter(
        (agencia) =>
          agencia.zona &&
          normalizarTexto(agencia.zona).includes(distritoNormalizado),
      );
    }

    // Registrar en consola para depuración
    if (departamento || provincia || distrito) {
      let filtroCombinado = [];
      if (departamento) filtroCombinado.push(`Departamento: ${departamento}`);
      if (provincia) filtroCombinado.push(`Provincia: ${provincia}`);
      if (distrito) filtroCombinado.push(`Distrito: ${distrito}`);
    }

    // Devolver el resultado filtrado según los datos solicitados
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              mensaje: "Lista de agencias filtradas.",
              datos: agenciasFiltradas.map((agencia) => {
                // Devolver solo la información solicitada según datosSolicitados
                const datoBasico: any = {
                  ter_id: agencia.ter_id,
                  departamento: agencia.departamento,
                  provincia: agencia.provincia,
                  distrito: agencia.zona,
                  direccion: agencia.direccion,
                  estado: agencia.estadoAgencia,
                };

                let resultado = { ...datoBasico };

                // Agregar cada tipo de dato solicitado al resultado
                datosSolicitados.forEach((dato) => {
                  switch (dato) {
                    case "lat-long":
                      resultado = {
                        ...resultado,
                        latitud: agencia.latitud,
                        longitud: agencia.longitud,
                      };
                      break;
                    case "horario":
                      resultado = {
                        ...resultado,
                        horaAtencion: agencia.horaAtencion,
                        horaDomingo: agencia.horaDomingo,
                      };
                      break;
                    case "estado-de-agencia":
                      resultado = {
                        ...resultado,
                        estadoAgencia: agencia.estadoAgencia,
                      };
                      break;
                  }
                });

                return resultado;
              }),
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        { type: "text", text: `Error al buscar agencias: ${error.message}` },
      ],
      isError: true,
    };
  }
}
