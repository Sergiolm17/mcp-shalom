# Shalom MCP Server

[![NPM Version](https://img.shields.io/npm/v/mcp-shalom.svg)](https://www.npmjs.com/package/mcp-shalom)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Servidor MCP para interactuar con los servicios de Shalom Courier en Perú. Permite a asistentes de IA como Claude realizar consultas y seguimientos de envíos utilizando el Model Context Protocol (MCP).

**Nota:** Este es un paquete no oficial y no está afiliado con Shalom Courier.

## Configuración y Uso con Clientes MCP

Este servidor MCP se puede integrar fácilmente con clientes compatibles como Claude Desktop y la extensión de Claude para VS Code. El paquete `mcp-shalom` se descargará y ejecutará automáticamente usando `npx`.

### Uso con Claude Desktop

Añade lo siguiente a tu archivo `claude_desktop_config.json`. La ubicación típica es:
*   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
*   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json` (ej: `C:\Users\TuUsuario\AppData\Roaming\Claude\claude_desktop_config.json`)
*   **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "shalom-mpc": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-shalom"
      ]
    }
  }
}
```
**Nota:** El nombre de la clave `"shalom-mpc"` es cómo Claude identificará este servidor. Puedes cambiarlo si lo deseas, pero debe ser único. El comando `npx -y mcp-shalom` ejecutará la última versión del paquete `mcp-shalom` desde npm.

### Uso con VS Code

Para usar este servidor MCP con la extensión de Claude para VS Code:

1.  Abre VS Code.
2.  Presiona `Ctrl + Shift + P` (o `Cmd + Shift + P` en macOS) para abrir la paleta de comandos.
3.  Escribe `Preferences: Open User Settings (JSON)` y selecciónalo.
4.  Añade el siguiente bloque JSON a tu configuración de usuario:

```json
{
  "mcp": {
    "servers": {
      "shalom-mpc": {
        "command": "npx",
        "args": [
          "-y",
          "mcp-shalom"
        ]
      }
    }
  }
}
```
Alternativamente, puedes crear un archivo `.vscode/mcp.json` en la raíz de tu espacio de trabajo y pegar el contenido de la clave `"mcp"` directamente (sin la clave `"mcp":` externa):
```json
{
  "servers": {
    "shalom-mpc": {
      "command": "npx",
      "args": ["-y", "mcp-shalom"]
    }
  }
}
```

## Herramientas (Tools)

Este servidor MCP expone las siguientes herramientas:

1.  **`buscarAgenciasPorUbicacion`**
    *   Descripción: Busca agencias de Shalom Courier filtrando por departamento, provincia y/o distrito.
    *   Entradas opcionales:
        *   `departamento (string)`: Nombre del departamento (ej. "AMAZONAS").
        *   `provincia (string)`: Nombre de la provincia (ej. "CHACHAPOYAS", "LIMA").
        *   `distrito (string)`: Nombre del distrito (ej. "TAMBO").
        *   `datosSolicitados (array de strings)`: Tipos de datos adicionales requeridos (ej. `["lat-long", "horario", "estado-de-agencia"]`).
    *   Retorna: Lista de agencias que coinciden con los criterios, con la información solicitada.
    *   Ejemplo de uso (payload para la herramienta):
        ```json
        {
          "departamento": "LIMA",
          "provincia": "LIMA",
          "datosSolicitados": ["lat-long", "horario"]
        }
        ```

2.  **`obtenerTarifas`**
    *   Descripción: Obtiene las tarifas de envío entre una agencia de origen y una agencia de destino utilizando sus identificadores TER.
    *   Entradas requeridas:
        *   `origen (number)`: TER ID de la agencia de origen (ej. 356).
        *   `destino (number)`: TER ID de la agencia de destino (ej. 48).
    *   Retorna: Información sobre las tarifas de envío.
    *   Ejemplo de uso (payload para la herramienta):
        ```json
        {
          "origen": 356,
          "destino": 48
        }
        ```

3.  **`rastrearEstados`**
    *   Descripción: Rastrea el estado actual de un envío utilizando el número de orden de servicio (OSE ID).
    *   Entradas requeridas:
        *   `ose_id (string)`: Número de orden de servicio a rastrear (ej. "49229631").
    *   Retorna: Información detallada sobre cada etapa del envío, incluyendo fechas y estados.
    *   Ejemplo de uso (payload para la herramienta):
        ```json
        {
          "ose_id": "49229631"
        }
        ```

4.  **`buscarGuia`**
    *   Descripción: Busca información detallada de un envío mediante su número de guía y código.
    *   Entradas requeridas:
        *   `numero (string)`: Número de la guía o orden (ej. "45751322").
        *   `codigo (string)`: Código alfanumérico de la guía (ej. "M7P7").
    *   Retorna: Datos completos sobre el origen, destino, remitente, destinatario, fechas, montos y estado del envío.
    *   Ejemplo de uso (payload para la herramienta):
        ```json
        {
          "numero": "45751322",
          "codigo": "M7P7"
        }
        ```

5.  **`obtenerGuiaRemision`**
    *   Descripción: Obtiene el enlace a la guía de remisión del transportista a partir del número y código de la guía.
    *   Entradas requeridas:
        *   `numero (string)`: Número de la guía o orden (ej. "45751322").
        *   `codigo (string)`: Código alfanumérico de la guía (ej. "M7P7").
    *   Retorna: Un objeto con el enlace a la guía de remisión.
    *   Ejemplo de uso (payload para la herramienta):
        ```json
        {
          "numero": "45751322",
          "codigo": "M7P7"
        }
        ```

## Variables de Entorno

Este servidor MCP (`mcp-shalom`) no requiere que se configuren variables de entorno adicionales a través del cliente MCP (Claude Desktop, VS Code, etc.) para su funcionamiento básico.

## Desarrollo (Development)

Si deseas contribuir al desarrollo de `mcp-shalom` o ejecutarlo localmente desde el código fuente:

1.  Clona el repositorio (si este README estuviera en un repositorio Git).
2.  Instala las dependencias:
    ```bash
    npm install mcp-shalom
    ```
    O, si has clonado el repositorio del paquete `mcp-shalom`:
    ```bash
    npm install
    ```
3.  Para ejecutar el servidor MCP localmente (esto dependerá de cómo esté estructurado el paquete `mcp-shalom`, pero usualmente podría ser un script en `package.json` o ejecutar el entry point directamente):
    ```bash
    # Ejemplo, podría ser diferente
    npx mcp-shalom
    # o
    # node path/to/server/script.js
    ```
    Consulta la documentación o el `package.json` de `mcp-shalom` para los comandos de desarrollo exactos.

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios propuestos o envía un pull request directamente (si este fuera el repositorio del proyecto).

## Licencia

MIT - [Sergio Lazaro Mondargo](mailto:sergiolazaromondargo@gmail.com)

Esta biblioteca está licenciada bajo la Licencia MIT. Esto significa que:
- Puedes usar este código libremente en proyectos personales y comerciales
- Puedes modificar este código según tus necesidades
- Puedes distribuir este código o trabajos derivados
- **DEBES** mantener el aviso de copyright y atribución original en cualquier copia o derivado de este proyecto.
