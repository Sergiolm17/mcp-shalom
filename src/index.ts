#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { buscarAgencias } from "./tools/buscarAgencias.js";
import { obtenerTarifasHandler } from "./tools/obtenerTarifas.js";
import { rastrearEstados } from "./tools/rastrearEstados.js";
import { buscarGuiaHandler } from "./tools/buscarGuia.js";
import { obtenerGuiaRemision } from "./tools/guiaRemision.js";
import { z } from "zod";

// Crear un servidor MCP
const server = new McpServer({
  name: "ShalomAPI",
  version: "1.0.3",
});

// 1. Lista de Agencias
server.tool(
  "buscarAgenciasPorUbicacion",
  "Busca agencias filtrando por provincia y/o departamento. Es obligatorio proporcionar al menos uno de los dos criterios de búsqueda (provincia o departamento). te puedo devolver también el TER ID",
  {
    departamento: z
      .string()
      .optional()
      .describe(
        "Nombre del departamento para filtrar las agencias. Ejemplo: 'AMAZONAS'",
      ),
    provincia: z
      .string()
      .optional()
      .describe(
        "Nombre de la provincia para filtrar las agencias. Ejemplo: 'CHACHAPOYAS', 'LIMA'",
      ),
    distrito: z
      .string()
      .optional()
      .describe(
        "Nombre de la provincia para filtrar las agencias. Ejemplo: 'TAMBO'",
      ),

    datosSolicitados: z
      .array(z.enum(["lat-long", "horario", "estado-de-agencia"]))
      .describe(
        "Especifica qué tipo(s) de dato(s) se requieren de las agencias. Valores permitidos: 'lat-long', 'horario', 'estado-de-agencia'. Se espera un array con uno o más valores.",
      ),
  },
  async ({
    provincia,
    departamento,
    distrito,
    datosSolicitados,
  }: {
    provincia?: string;
    departamento?: string;
    distrito?: string;
    datosSolicitados: Array<"lat-long" | "horario" | "estado-de-agencia">;
  }) => {
    const result = await buscarAgencias({
      provincia,
      departamento,
      distrito,
      datosSolicitados,
    });
    return {
      content: result.content.map((item) => ({
        ...item,
      })),
      isError: result.isError,
    };
  },
);

// 2. Consulta de Tarifas
server.tool(
  "obtenerTarifas",
  "Obtiene las tarifas de envío entre una agencia de origen y una agencia de destino usando el TER ID",
  {
    origen: z
      .number()
      .describe("TER ID de la agencia de origen. Ejemplo: '356'"),
    destino: z
      .number()
      .describe("TER ID de la agencia de destino. Ejemplo: '48'"),
  },
  async ({ origen, destino }: { origen: number; destino: number }) => {
    const result = await obtenerTarifasHandler(origen, destino);
    return {
      content: result.content.map((item) => ({
        ...item,
      })),
      isError: result.isError,
    };
  },
);

// 3. Rastreo de Estados
server.tool(
  "rastrearEstados",
  "Rastrea el estado de un envío utilizando el número de orden de servicio (OSE ID)",
  {
    ose_id: z
      .string()
      .describe("Número de orden de servicio a rastrear. Ejemplo: '49229631'"),
  },
  async ({ ose_id }: { ose_id: string }) => {
    const result = await rastrearEstados(ose_id);
    return {
      content: result.content.map((item) => ({
        ...item,
      })),
      isError: result.isError,
    };
  },
);

// 4. Buscar Guía
server.tool(
  "buscarGuia",
  "Busca información detallada de un envío mediante su número y código",
  {
    numero: z
      .string()
      .describe("Número de la guía o orden. Ejemplo: '45751322'"),
    codigo: z
      .string()
      .describe("Código alfanumérico de la guía. Ejemplo: 'M7P7'"),
  },
  async ({ numero, codigo }: { numero: string; codigo: string }) => {
    const result = await buscarGuiaHandler(numero, codigo);
    return {
      content: result.content.map((item) => ({
        ...item,
      })),
      isError: result.isError,
    };
  },
);

// 5. Obtener Guía de Remisión
server.tool(
  "obtenerGuiaRemision",
  "Obtiene el enlace a la guía de remisión del transportista a partir del número y código de la guía",
  {
    numero: z
      .string()
      .describe("Número de la guía o orden. Ejemplo: '45751322'"),
    codigo: z
      .string()
      .describe("Código alfanumérico de la guía. Ejemplo: 'M7P7'"),
  },
  async ({ numero, codigo }: { numero: string; codigo: string }) => {
    // Paso 1: Buscar la guía para obtener el ose_id
    const buscarResult = await buscarGuiaHandler(numero, codigo);

    if (buscarResult.isError) {
      return {
        content: buscarResult.content.map((item) => ({
          ...item,
        })),
        isError: true,
      };
    }

    // Extraer el ose_id de la respuesta
    const buscarData = JSON.parse(buscarResult.content[0].text);
    const ose_id = buscarData.ose_id.toString();

    if (!ose_id) {
      return {
        content: [
          {
            type: "text",
            text: "No se pudo obtener el ose_id necesario para la guía de remisión",
          },
        ],
        isError: true,
      };
    }

    // Paso 2: Obtener los estados para conseguir el cap_id
    const estadosResult = await rastrearEstados(ose_id);

    if (estadosResult.isError) {
      return {
        content: estadosResult.content.map((item) => ({
          ...item,
        })),
        isError: true,
      };
    }

    // Extraer el cap_id de la respuesta
    const estadosData = JSON.parse(estadosResult.content[0].text);
    const cap_id = estadosData.datosCompletos.transito.carguero;

    if (!cap_id) {
      return {
        content: [
          {
            type: "text",
            text: "No se pudo obtener el cap_id necesario para la guía de remisión",
          },
        ],
        isError: true,
      };
    }

    // Paso 3: Obtener la guía de remisión con ose_id y cap_id
    const result = await obtenerGuiaRemision(ose_id, cap_id);
    return {
      content: result.content.map((item) => ({
        ...item,
      })),
      isError: result.isError,
    };
  },
);

// Iniciar el servidor con transporte stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.exit(1);
});
