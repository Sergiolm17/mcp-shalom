# Shalom MCP Server

[![NPM Version](https://img.shields.io/npm/v/mcp-shalom.svg)](https://www.npmjs.com/package/mcp-shalom)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

MCP Server for interacting with Shalom Courier services in Peru. Allows AI assistants like Claude to perform queries and track shipments using the Model Context Protocol (MCP).

**Note:** This is an unofficial package and is not affiliated with Shalom Courier.

## Setup and Usage with MCP Clients

This MCP server can be easily integrated with compatible clients like Claude Desktop and the Claude extension for VS Code. The `mcp-shalom` package will be automatically downloaded and run using `npx`.

### Usage with Claude Desktop

Add the following to your `claude_desktop_config.json` file. The typical location is:
*   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
*   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json` (e.g., `C:\Users\YourUser\AppData\Roaming\Claude\claude_desktop_config.json`)
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
**Note:** The key name `"shalom-mpc"` is how Claude will identify this server. You can change it if you wish, but it must be unique. The command `npx -y mcp-shalom` will run the latest version of the `mcp-shalom` package from npm.

### Usage with VS Code

To use this MCP server with the Claude extension for VS Code:

1.  Open VS Code.
2.  Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS) to open the command palette.
3.  Type `Preferences: Open User Settings (JSON)` and select it.
4.  Add the following JSON block to your user settings:

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
Alternatively, you can create a `.vscode/mcp.json` file in the root of your workspace and paste the content of the `"mcp"` key directly (without the outer `"mcp":` key):
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

## Tools

This MCP server exposes the following tools:

1.  **`buscarAgenciasPorUbicacion`** (Search Agencies by Location)
    *   Description: Searches for Shalom Courier agencies, filtering by department, province, and/or district.
    *   Optional inputs:
        *   `departamento (string)`: Department name (e.g., "AMAZONAS").
        *   `provincia (string)`: Province name (e.g., "CHACHAPOYAS", "LIMA").
        *   `distrito (string)`: District name (e.g., "TAMBO").
        *   `datosSolicitados (array of strings)`: Additional requested data types (e.g., `["lat-long", "horario", "estado-de-agencia"]`).
    *   Returns: A list of agencies matching the criteria, with the requested information.
    *   Usage example (tool payload):
        ```json
        {
          "departamento": "LIMA",
          "provincia": "LIMA",
          "datosSolicitados": ["lat-long", "horario"]
        }
        ```

2.  **`obtenerTarifas`** (Get Rates)
    *   Description: Gets shipping rates between an origin agency and a destination agency using their TER IDs.
    *   Required inputs:
        *   `origen (number)`: TER ID of the origin agency (e.g., 356).
        *   `destino (number)`: TER ID of the destination agency (e.g., 48).
    *   Returns: Information about shipping rates.
    *   Usage example (tool payload):
        ```json
        {
          "origen": 356,
          "destino": 48
        }
        ```

3.  **`rastrearEstados`** (Track Statuses)
    *   Description: Tracks the current status of a shipment using the service order number (OSE ID).
    *   Required inputs:
        *   `ose_id (string)`: Service order number to track (e.g., "49229631").
    *   Returns: Detailed information about each stage of the shipment, including dates and statuses.
    *   Usage example (tool payload):
        ```json
        {
          "ose_id": "49229631"
        }
        ```

4.  **`buscarGuia`** (Search Waybill)
    *   Description: Searches for detailed information about a shipment using its waybill number and code.
    *   Required inputs:
        *   `numero (string)`: Waybill or order number (e.g., "45751322").
        *   `codigo (string)`: Alphanumeric waybill code (e.g., "M7P7").
    *   Returns: Complete data about the origin, destination, sender, recipient, dates, amounts, and status of the shipment.
    *   Usage example (tool payload):
        ```json
        {
          "numero": "45751322",
          "codigo": "M7P7"
        }
        ```

5.  **`obtenerGuiaRemision`** (Get Carrier's Waybill/Delivery Note)
    *   Description: Gets the link to the carrier's waybill/delivery note from the waybill number and code.
    *   Required inputs:
        *   `numero (string)`: Waybill or order number (e.g., "45751322").
        *   `codigo (string)`: Alphanumeric waybill code (e.g., "M7P7").
    *   Returns: An object with the link to the waybill/delivery note.
    *   Usage example (tool payload):
        ```json
        {
          "numero": "45751322",
          "codigo": "M7P7"
        }
        ```

## Environment Variables

This MCP server (`mcp-shalom`) does not require additional environment variables to be configured through the MCP client (Claude Desktop, VS Code, etc.) for its basic operation.

## Development

If you wish to contribute to the development of `mcp-shalom` or run it locally from the source code:

1.  Clone the repository (if this README were in a Git repository).
2.  Install dependencies:
    ```bash
    npm install mcp-shalom
    ```
    Or, if you have cloned the `mcp-shalom` package repository:
    ```bash
    npm install
    ```
3.  To run the MCP server locally (this will depend on how the `mcp-shalom` package is structured, but it could typically be a script in `package.json` or by running the entry point directly):
    ```bash
    # Example, might be different
    npx mcp-shalom
    # or
    # node path/to/server/script.js
    ```
    Consult the `mcp-shalom` documentation or `package.json` for the exact development commands.

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes or submit a pull request directly (if this were the project's repository).

## License

MIT - [Sergio Lazaro Mondargo](mailto:sergiolazaromondargo@gmail.com)

This library is licensed under the MIT License. This means that:
- You can use this code freely in personal and commercial projects
- You can modify this code according to your needs
- You can distribute this code or derivative works
- You **MUST** retain the original copyright notice and attribution in any copies or derivatives of this project.
