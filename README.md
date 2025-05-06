# MCP-Shalom

API cliente para los servicios de Shalom courier en Perú, implementando Model Context Protocol (MCP).

[![NPM Version](https://img.shields.io/npm/v/mcp-shalom.svg)](https://www.npmjs.com/package/mcp-shalom)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Descripción

MCP-Shalom es una biblioteca cliente que proporciona acceso a los servicios web de Shalom Courier en Perú a través del protocolo MCP (Model Context Protocol). Este paquete no es oficial y no está afiliado con Shalom Courier. Permite realizar operaciones como:

- Búsqueda de agencias por ubicación geográfica
- Consulta de tarifas de envío entre agencias
- Rastreo de estados de envíos
- Búsqueda de información detallada de guías
- Obtención de guías de remisión del transportista

Esta biblioteca implementa el estándar MCP, lo que facilita su integración con asistentes de IA y otros sistemas compatibles con este protocolo.

## Instalación

```bash
npm install mcp-shalom
```

Requisitos:
- Node.js >= 16.0.0

## Uso

### Como biblioteca

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Iniciar el servidor MCP
const server = new McpServer({
  name: "ShalomAPI",
  version: "1.0.0",
});

// Conectar el servidor al transporte
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Como herramienta de línea de comandos

```bash
npx shalom-api
```

## Características

### 1. Búsqueda de Agencias por Ubicación

Permite buscar agencias de Shalom Courier filtrando por departamento, provincia y/o distrito. También puede devolver información adicional como coordenadas geográficas, horarios y estado de las agencias.

### 2. Consulta de Tarifas

Obtiene las tarifas de envío entre una agencia de origen y una agencia de destino utilizando sus identificadores TER.

### 3. Rastreo de Estados

Rastrea el estado actual de un envío utilizando el número de orden de servicio (OSE ID). Proporciona información detallada sobre cada etapa del envío, incluyendo fechas y estados.

### 4. Búsqueda de Guía

Busca información detallada de un envío mediante su número de guía y código. Devuelve datos completos sobre el origen, destino, remitente, destinatario, fechas, montos y estado del envío.

### 5. Obtención de Guía de Remisión

Obtiene el enlace a la guía de remisión del transportista a partir del número y código de la guía.

## Documentación de la API

### buscarAgenciasPorUbicación

Busca agencias filtrando por provincia y/o departamento.

**Parámetros:**
- `departamento` (opcional): Nombre del departamento (ej. "AMAZONAS")
- `provincia` (opcional): Nombre de la provincia (ej. "CHACHAPOYAS", "LIMA")
- `distrito` (opcional): Nombre del distrito (ej. "TAMBO")
- `datosSolicitados`: Array con tipos de datos requeridos ("lat-long", "horario", "estado-de-agencia")

**Ejemplo:**
```javascript
{
  "departamento": "LIMA",
  "provincia": "LIMA",
  "datosSolicitados": ["lat-long", "horario"]
}
```

### obtenerTarifas

Obtiene las tarifas de envío entre una agencia de origen y una agencia de destino.

**Parámetros:**
- `origen`: TER ID de la agencia de origen (ej. 356)
- `destino`: TER ID de la agencia de destino (ej. 48)

**Ejemplo:**
```javascript
{
  "origen": 356,
  "destino": 48
}
```

### rastrearEstados

Rastrea el estado de un envío utilizando el número de orden de servicio.

**Parámetros:**
- `ose_id`: Número de orden de servicio a rastrear (ej. "49229631")

**Ejemplo:**
```javascript
{
  "ose_id": "49229631"
}
```

### buscarGuia

Busca información detallada de un envío mediante su número y código.

**Parámetros:**
- `numero`: Número de la guía o orden (ej. "45751322")
- `codigo`: Código alfanumérico de la guía (ej. "M7P7")

**Ejemplo:**
```javascript
{
  "numero": "45751322",
  "codigo": "M7P7"
}
```

### obtenerGuiaRemision

Obtiene el enlace a la guía de remisión del transportista.

**Parámetros:**
- `numero`: Número de la guía o orden (ej. "45751322")
- `codigo`: Código alfanumérico de la guía (ej. "M7P7")

**Ejemplo:**
```javascript
{
  "numero": "45751322",
  "codigo": "M7P7"
}
```

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios propuestos o envía un pull request directamente.

## Licencia

MIT - [Sergio Lazaro Mondargo](mailto:sergiolazaromondargo@gmail.com)

Esta biblioteca está licenciada bajo la Licencia MIT. Esto significa que:

- Puedes usar este código libremente en proyectos personales y comerciales
- Puedes modificar este código según tus necesidades
- Puedes distribuir este código o trabajos derivados
- **DEBES** mantener el aviso de copyright y atribución original en cualquier copia o derivado de este proyecto

### Texto completo de la licencia
