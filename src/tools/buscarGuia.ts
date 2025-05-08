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
 * Tipos de secciones de datos que se pueden solicitar para una guía.
 */
export type SeccionGuia =
    | "detalles_guia"
    | "estado_envio"
    | "info_pago"
    | "origen"
    | "destino"
    | "involucrados";

const SECCIONES_VALIDAS: SeccionGuia[] = [
    "detalles_guia",
    "estado_envio",
    "info_pago",
    "origen",
    "destino",
    "involucrados",
];


/**
 * Formatea valores que pueden ser booleanos o strings "0"/"1" desde la API.
 */
function formatApiBoolean(
    value: string | boolean | undefined | null,
    trueText: string,
    falseText: string,
    defaultText: string = "No especificado",
): string {
    if (value === "1" || value === true) return trueText;
    if (value === "0" || value === false) return falseText;
    if (value === null || value === undefined || (value.trim() === "")) return defaultText;
    return String(value);
}

/**
 * Busca información de un envío y devuelve solo las secciones solicitadas.
 * @param numero Número de guía o orden de envío
 * @param codigo Código alfanumérico asociado a la guía
 * @param datosSolicitados Array opcional de secciones a incluir en la respuesta. Si no se provee o está vacío, se devuelve toda la información.
 * @returns Objeto con la información detallada del envío en formato de texto.
 */
export async function buscarGuiaHandler(
    numero: string,
    codigo: string,
    datosSolicitados?: SeccionGuia[],
): Promise<BuscarGuiaResult> {
    const url = "https://servicesweb.shalomcontrol.com/api/v1/web/rastrea/buscar";

    const formData = new FormData();
    formData.append("numero", numero);
    formData.append("codigo", codigo);
    formData.append("ose_id", "");

    const headers = new Headers({
        ...COMMON_HEADERS,
        Referer: "https://rastrea.shalom.pe/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    });

    const requestOptions: RequestInit = {
        method: "POST",
        headers: headers,
        body: formData,
    };

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            const errorText = await response.text().catch(() => "No se pudo leer el cuerpo del error.");
            console.error(`Error HTTP ${response.status}: ${response.statusText}. Cuerpo: ${errorText}`);
            return {
                content: [{ type: "text", text: `Error al conectar con el servicio de Shalom: ${response.status} ${response.statusText}` }],
                isError: true,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        const responseData = await response.json();

        try {
            const validatedData = esquemaRespuestaBusqueda.parse(responseData) as RespuestaBusqueda;

            if (!validatedData.success) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `No se pudo obtener la información de la guía: ${validatedData.message || "Respuesta no exitosa de la API."}`,
                        },
                    ],
                    isError: true,
                    error: validatedData.message || "Respuesta no exitosa de la API.",
                };
            }

            const guia = validatedData.data;
            const bloquesDeTexto: string[] = [];
            const mostrarTodo = !datosSolicitados || datosSolicitados.length === 0;

            // Sección: Detalles de la Guía
            if (mostrarTodo || datosSolicitados?.includes("detalles_guia")) {
                let contenidoSeccion = "--- 📜 Detalles de la Guía ---\n";
                contenidoSeccion += `Número de Orden: ${guia.numero_orden || "N/A"}\n`;
                contenidoSeccion += `Código de Orden: ${guia.codigo_orden || "N/A"}\n`;
                contenidoSeccion += `ID OSE: ${guia.ose_id || "N/A"}`;
                bloquesDeTexto.push(contenidoSeccion.trim());
            }

            // Sección: Estado del Envío
            if (mostrarTodo || datosSolicitados?.includes("estado_envio")) {
                let contenidoSeccion = "--- 📦 Estado del Envío ---\n";
                contenidoSeccion += `Fecha de Emisión: ${guia.fecha_emision || "N/A"}\n`;
                contenidoSeccion += `Fecha Estimada de Traslado: ${guia.fecha_traslado || "N/A"}\n`;
                contenidoSeccion += `Estado: ${formatApiBoolean(guia.entregado, "✅ Entregado", "⏳ En Tránsito / Pendiente")}\n`;
                contenidoSeccion += `Tiempo Estimado de Llegada: ${guia.tiempo_llegada || "N/A"}\n`;
                contenidoSeccion += `Dirección de Entrega: ${guia.direccion_entrega || "N/A"}\n`;
                contenidoSeccion += `Contenido Declarado: ${guia.contenido || "N/A"}\n`;
                contenidoSeccion += `Reparto a Domicilio: ${formatApiBoolean(guia.reparto, "Sí", "No")}\n`;
                contenidoSeccion += `Transporte Aéreo: ${formatApiBoolean(guia.aereo, "Sí (Aéreo)", "No (Terrestre)")}`;
                bloquesDeTexto.push(contenidoSeccion.trim());
            }

            // Sección: Información de Pago
            if (mostrarTodo || datosSolicitados?.includes("info_pago")) {
                let contenidoSeccion = "--- 💳 Información de Pago ---\n";
                contenidoSeccion += `Tipo de Pago: ${guia.tipo_pago || "N/A"}\n`;
                contenidoSeccion += `Estado del Pago: ${guia.estado_pago || "N/A"}\n`;
                contenidoSeccion += `Monto: ${guia.monto ? `S/ ${guia.monto}` : "N/A"}`;
                bloquesDeTexto.push(contenidoSeccion.trim());
            }

            // Sección: Origen
            if (mostrarTodo || datosSolicitados?.includes("origen")) {
                let contenidoSeccion = "--- ⬅️ Origen ---\n";
                if (guia.origen) {
                    contenidoSeccion += `Agencia: ${guia.origen.nombre || "N/A"} (${guia.origen.abrebiatura || "N/A"})\n`;
                    contenidoSeccion += `Ubicación: ${guia.origen.departamento || "N/A"}, ${guia.origen.provincia || "N/A"}, ${guia.origen.distrito || "N/A"}`;
                } else {
                    contenidoSeccion += "Información de origen no disponible.";
                }
                bloquesDeTexto.push(contenidoSeccion.trim());
            }

            // Sección: Destino
            if (mostrarTodo || datosSolicitados?.includes("destino")) {
                let contenidoSeccion = "--- ➡️ Destino ---\n";
                if (guia.destino) {
                    contenidoSeccion += `Agencia: ${guia.destino.nombre || "N/A"} (${guia.destino.abrebiatura || "N/A"})\n`;
                    contenidoSeccion += `Ubicación: ${guia.destino.departamento || "N/A"}, ${guia.destino.provincia || "N/A"}, ${guia.destino.distrito || "N/A"}`;
                } else {
                    contenidoSeccion += "Información de destino no disponible.";
                }
                bloquesDeTexto.push(contenidoSeccion.trim());
            }

            // Sección: Involucrados
            if (mostrarTodo || datosSolicitados?.includes("involucrados")) {
                let contenidoSeccion = "--- 👥 Involucrados ---\n";
                contenidoSeccion += `Remitente: ${guia.remitente || "N/A"}\n`;
                contenidoSeccion += `Destinatario: ${guia.destinatario || "N/A"}`;
                bloquesDeTexto.push(contenidoSeccion.trim());
            }

            let textoResultadoFinal: string;
            if (bloquesDeTexto.length > 0) {
                textoResultadoFinal = "🚚 **Información de tu Envío Shalom** 🚚\n\n";
                textoResultadoFinal += bloquesDeTexto.join("\n\n"); // Une los bloques con un doble salto de línea
            } else {
                if (datosSolicitados && datosSolicitados.length > 0) {
                    const invalidas = datosSolicitados.filter(s => !SECCIONES_VALIDAS.includes(s));
                    if (invalidas.length > 0) {
                        textoResultadoFinal = `Una o más secciones solicitadas son inválidas (${invalidas.join(', ')}). Las secciones válidas son: ${SECCIONES_VALIDAS.join(", ")}.`;
                    } else {
                        textoResultadoFinal = "No se encontró información para las secciones solicitadas.";
                    }
                } else {
                    textoResultadoFinal = "No hay información detallada disponible para mostrar para esta guía.";
                }
            }

            return {
                content: [{ type: "text", text: textoResultadoFinal.trim() }],
                isError: false, // La operación fue exitosa, aunque no haya datos para las secciones pedidas
            };

        } catch (validationError: any) {
            console.error("Error de validación Zod en buscarGuiaHandler:", validationError.errors || validationError.message);
            let errorDetails = "Formato de datos inesperado.";
            if (validationError.errors && Array.isArray(validationError.errors)) {
                errorDetails = validationError.errors.map((e: any) => `Campo '${e.path.join('.')}' ${e.message.toLowerCase()}`).join('; ');
            } else if (validationError.message) {
                errorDetails = validationError.message;
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `No se pudo procesar la respuesta del servicio de Shalom. (Detalle: ${errorDetails})`,
                    },
                ],
                isError: true,
                error: "Error de validación de datos: " + errorDetails,
            };
        }
    } catch (error: any) {
        console.error("Error en fetch buscarGuiaHandler:", error);
        return {
            content: [
                { type: "text", text: `Error al intentar buscar la guía: ${error.message}. Verifica tu conexión o inténtalo más tarde.` },
            ],
            isError: true,
            error: error.message,
        };
    }
}