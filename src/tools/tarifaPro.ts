import { z } from "zod";
import fetch, { Headers, RequestInit } from "node-fetch";
import { COMMON_HEADERS } from "../config/headers.js";

/**
 * Tool for calculating pro tariffs
 */
export const calcularTarifaPro = {
  name: "calcularTarifaPro",
  description:
    "Calcula tarifas profesionales entre dos agencias con dimensiones opcionales",
  schema: {
    origin: z.number().describe("ID de la agencia de origen (ej: 20)"),
    destiny: z.number().describe("ID de la agencia de destino (ej: 17)"),
    width: z.string().optional().describe("Ancho (opcional)"),
    height: z.string().optional().describe("Alto (opcional)"),
    length: z.string().optional().describe("Largo (opcional)"),
    weight: z.string().optional().describe("Peso (opcional)"),
  },
  handler: async ({
    origin,
    destiny,
    width,
    height,
    length,
    weight,
  }: {
    origin: number;
    destiny: number;
    width?: string;
    height?: string;
    length?: string;
    weight?: string;
  }) => {
    const url = "https://pro.shalom.pe/envia_ya/tariff/calculate";
    const body = JSON.stringify({
      origin: origin,
      destiny: destiny,
      width: width || "",
      height: height || "",
      length: length || "",
      weight: weight || "",
    });
    const headers = new Headers({
      ...COMMON_HEADERS,
      accept: "application/json",
      "content-type": "application/json;charset=UTF-8",
      Referer: "https://pro.shalom.pe/",
    });
    const requestOptions: RequestInit = {
      method: "POST",
      headers: headers,
      body: body,
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
            text: `Error al calcular tarifa pro: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};
