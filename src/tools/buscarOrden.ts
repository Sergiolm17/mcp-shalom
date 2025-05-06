import { z } from "zod";
import fetch, { Headers, RequestInit } from "node-fetch";
import { COMMON_HEADERS } from "../config/headers.js";

/**
 * Tool for searching orders by number and code
 */
export const buscarOrdenPorNumeroCodigo = {
  name: "buscarOrdenPorNumeroCodigo",
  description: "Busca una orden utilizando su número y código",
  schema: {
    numero: z.string().describe("Número de orden"),
    codigo: z.string().describe("Código de la orden"),
    ose_id: z
      .string()
      .optional()
      .describe(
        "ID de la orden de servicio (opcional, la API lo espera vacío si no se usa)",
      ),
  },
  handler: async ({
    numero,
    codigo,
    ose_id,
  }: {
    numero: string;
    codigo: string;
    ose_id?: string;
  }) => {
    const url =
      "https://servicespayment.shalomcontrol.com/api/v1/web/pagalo/buscar";
    const form = new FormData();
    form.append("numero", numero);
    form.append("codigo", codigo);
    form.append("ose_id", ose_id || ""); // Enviar vacío si es undefined
    const headers = new Headers({
      ...COMMON_HEADERS,
      Referer: "https://pagalo.shalom.pe/",
    });
    const requestOptions: RequestInit = {
      method: "POST",
      headers: headers,
      body: form,
    };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [
          { type: "text", text: `Error al buscar orden: ${error.message}` },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Tool for checking order status
 */
export const buscarEstadoOrden = {
  name: "buscarEstadoOrden",
  description: "Busca el estado de una orden utilizando su ID",
  schema: {
    ose_id: z.string().describe("ID de la orden de servicio (ej: 49229631)"),
  },
  handler: async ({ ose_id }: { ose_id: string }) => {
    const url =
      "https://servicesweb.shalomcontrol.com/api/v1/web/rastrea/estados";
    const form = new FormData();
    form.append("ose_id", ose_id);
    const headers = new Headers({
      ...COMMON_HEADERS,
      Referer: "https://rastrea.shalom.pe/",
    });
    const requestOptions: RequestInit = {
      method: "POST",
      headers: headers,
      body: form,
    };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error al buscar estado de orden: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};
