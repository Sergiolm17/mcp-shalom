import fetch, { Headers, RequestInit } from "node-fetch";
import { COMMON_HEADERS } from "../config/headers.js";
// Asegúrate de que Agencia y RespuestaApi estén bien definidas
import { RespuestaApi, Agencia } from "../interface/ListaDeAgencias.js";
import { normalizarTexto } from "../utils/text.js";

export interface ContentItem {
  type: "text";
  text: string;
}

export interface BuscarAgenciasResult {
  content: ContentItem[];
  isError?: boolean;
}

interface AgenciaConScore extends Agencia {
  score?: number;
}

/**
 * Busca agencias.
 * 1. Filtra jerárquicamente por departamento, provincia y/o distrito (si se proporcionan).
 * 2. Luego, si se proporcionan palabrasClave, filtra y ordena los resultados basándose en la relevancia de estas palabras
 *    en los campos de la agencia.
 * Es obligatorio proporcionar al menos uno de los criterios de búsqueda.
 */
export async function buscarAgencias({
                                       departamento,
                                       provincia,
                                       distrito,
                                       palabrasClave,
                                       datosSolicitados,
                                       maxResultados = 3, // Nuevo parámetro con valor por defecto
                                     }: {
  departamento?: string;
  provincia?: string;
  distrito?: string;
  palabrasClave?: string;
  datosSolicitados: Array<"lat-long" | "horario" | "estado-de-agencia">;
  maxResultados?: number; // Para controlar cuántos resultados detallados mostrar
}): Promise<BuscarAgenciasResult> {
  if (!provincia && !departamento && !distrito && !palabrasClave) {
    return {
      content: [
        {
          type: "text",
          text: "Por favor, proporciona al menos un criterio de búsqueda: departamento, provincia, distrito o palabras clave.",
        },
      ],
      isError: true,
    };
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
    if (!response.ok) {
      return {
        content: [
          {
            type: "text",
            text: `Error al contactar la API de Shalom: ${response.status} ${response.statusText}`,
          },
        ],
        isError: true,
      };
    }
    const responseJson = (await response.json()) as RespuestaApi;

    if (!responseJson.success) {
      return {
        content: [
          { type: "text", text: `Error de la API Shalom: ${responseJson.message}` },
        ],
        isError: true,
      };
    }

    let agenciasCandidatas: AgenciaConScore[] = responseJson.data.map(ag => ({ ...ag, score: 0 }));

    // --- PASO 1: Filtrado Jerárquico ---
    const departamentoNormalizado = departamento
        ? normalizarTexto(departamento)
        : "";
    const provinciaNormalizada = provincia ? normalizarTexto(provincia) : "";
    const distritoNormalizado = distrito ? normalizarTexto(distrito) : "";

    if (departamentoNormalizado) {
      agenciasCandidatas = agenciasCandidatas.filter((agencia) =>
          normalizarTexto(agencia.departamento).includes(departamentoNormalizado)
      );
    }
    if (provinciaNormalizada) {
      agenciasCandidatas = agenciasCandidatas.filter((agencia) =>
          normalizarTexto(agencia.provincia).includes(provinciaNormalizada)
      );
    }
    if (distritoNormalizado) {
      agenciasCandidatas = agenciasCandidatas.filter(
          (agencia) =>
              agencia.zona &&
              normalizarTexto(agencia.zona).includes(distritoNormalizado)
      );
    }

    // --- PASO 2: Búsqueda Avanzada por Palabras Clave ---
    if (palabrasClave && palabrasClave.trim() !== "") {
      const terminosBusqueda = normalizarTexto(palabrasClave)
          .toLowerCase()
          .split(/\s+/)
          .filter(term => term.length > 0);

      if (terminosBusqueda.length > 0) {
        agenciasCandidatas = agenciasCandidatas
            .map((agencia) => {
              let matchScore = 0;
              let allTermsFound = true;

              const camposPonderados = [
                { nombre: "nombre", texto: agencia.nombre, peso: 3 },
                { nombre: "zona", texto: agencia.zona, peso: 5 },
                { nombre: "direccion", texto: agencia.direccion, peso: 2 },
                { nombre: "provincia", texto: agencia.provincia, peso: 4 },
                { nombre: "departamento", texto: agencia.departamento, peso: 4 },
                { nombre: "estadoAgencia", texto: agencia.estadoAgencia, peso: 1}
              ];

              const textoConcatenadoNormalizado = camposPonderados
                  .map(cp => cp.texto ? normalizarTexto(cp.texto).toLowerCase() : "")
                  .join(" ");

              for (const termino of terminosBusqueda) {
                if (!textoConcatenadoNormalizado.includes(termino)) {
                  allTermsFound = false;
                  break;
                }
                for (const campo of camposPonderados) {
                  if (campo.texto && normalizarTexto(campo.texto).toLowerCase().includes(termino)) {
                    matchScore += campo.peso;
                  }
                }
              }

              if (allTermsFound) {
                return { ...agencia, score: (agencia.score || 0) + matchScore };
              }
              return { ...agencia, score: -1 };
            })
            .filter(agencia => agencia.score !== undefined && agencia.score > -1);

        agenciasCandidatas.sort((a, b) => (b.score || 0) - (a.score || 0));
      }
    }

    // --- PASO 3: Formatear Salida ---
    let resultadoTexto = "";
    const totalAgenciasEncontradas = agenciasCandidatas.length;

    if (totalAgenciasEncontradas === 0) {
      resultadoTexto =
          "No se encontraron agencias que coincidan con los criterios de búsqueda.";
    } else {
      const esSingular = totalAgenciasEncontradas === 1;
      resultadoTexto = `Se ${esSingular ? "encontró" : "encontraron"} ${totalAgenciasEncontradas} ${esSingular ? "agencia" : "agencias"}${palabrasClave ? " (ordenadas por relevancia)" : ""}.\n`;

      if (totalAgenciasEncontradas > 0 && totalAgenciasEncontradas <= maxResultados) {
        resultadoTexto += `Mostrando ${totalAgenciasEncontradas}:\n\n`;
      } else if (totalAgenciasEncontradas > maxResultados) {
        resultadoTexto += `Mostrando las ${maxResultados} más relevantes:\n\n`;
      }

      const agenciasAMostrar = agenciasCandidatas.slice(0, maxResultados);

      agenciasAMostrar.forEach((agencia, index) => {
        resultadoTexto += `--- Agencia ${index + 1} ---\n`;
        resultadoTexto += `Nombre: ${agencia.nombre}\n`;
        resultadoTexto += `ID: ${agencia.ter_id}\n`;
        resultadoTexto += `Ubicación: ${agencia.departamento} - ${agencia.provincia} - ${agencia.zona || "N/A"}\n`;
        resultadoTexto += `Dirección: ${agencia.direccion}\n`;

        if (datosSolicitados.includes("lat-long")) {
          resultadoTexto += `Coordenadas: Lat ${agencia.latitud}, Lon ${agencia.longitud}\n`;
        }
        if (datosSolicitados.includes("horario")) {
          resultadoTexto += `Horario Atención: ${agencia.horaAtencion || "No especificado"}\n`;
          if (agencia.horaDomingo) {
            resultadoTexto += `Horario Domingo: ${agencia.horaDomingo}\n`;
          }
        }
        if (datosSolicitados.includes("estado-de-agencia")) {
          resultadoTexto += `Estado Agencia: ${agencia.estadoAgencia}\n`;
        }
        resultadoTexto += "\n";
      });

      if (totalAgenciasEncontradas > maxResultados) {
        const agenciasRestantes = agenciasCandidatas.slice(maxResultados);
        const nombresAgenciasRestantes = agenciasRestantes
            .map(ag => `${ag.nombre} (ID: ${ag.ter_id})`) // Muestra nombre e ID
            .slice(0, 5); // Mostrar hasta 5 nombres/IDs adicionales para no saturar

        resultadoTexto += `Hay ${totalAgenciasEncontradas - maxResultados} agencia(s) más cerca:\n`;
        resultadoTexto += nombresAgenciasRestantes.join(" | ");
        if (agenciasRestantes.length > nombresAgenciasRestantes.length) {
          resultadoTexto += ` | ...y ${agenciasRestantes.length - nombresAgenciasRestantes.length} más.`;
        }
        resultadoTexto += "\n\nPara ver más detalles, por favor refina tu búsqueda o contacta con atención al cliente.";
      }
    }

    return {
      content: [{ type: "text", text: resultadoTexto.trim() }],
    };
  } catch (error: any) {
    console.error("Error en buscarAgencias:", error);
    return {
      content: [
        {
          type: "text",
          text: `Ocurrió un error inesperado al buscar agencias: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}