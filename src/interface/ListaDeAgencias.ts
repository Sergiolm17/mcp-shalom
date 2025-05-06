import { z } from "zod"; // Asegúrate de tener zod instalado (npm install zod)

// Esquema para cada objeto de agencia dentro del array 'datos'
const esquemaAgencia = z.object({
  ter_id: z.number(),
  idTerminal: z.number(), // Ejemplo: 3
  abreviaturaTerminal: z.string(), // Ejemplo: "CHH"
  zona: z.string(), // Ejemplo: "CHACHAPOYAS"
  zonaTerminal: z.string(), // Ejemplo: "ORIENTE 1"
  provincia: z.string(), // Ejemplo: "CHACHAPOYAS"
  departamento: z.string(), // Ejemplo: "AMAZONAS"
  lugar: z.string().nullable(), // Puede ser un string o null. Ejemplo: "CHACHAPOYAS CO DOS DE MAYO", null
  latitud: z.string(), // Se guarda como string. Ejemplo: "-6.238673290149498"
  longitud: z.string(), // Se guarda como string. Ejemplo: "-77.86800826533634"
  sp: z.string(), // Puede ser un número como string o vacío. Ejemplo: "2", ""
  imagen: z.string(), // Puede ser una ruta o vacío. Ejemplo: "img/local.jpg", ""
  direccion: z.string(), // Ejemplo: "JR. DOS DE MAYO CDRA. 15 S/N CHACHAPOYAS..."
  telefono: z.string(), // Ejemplo: "(01) 500 7878"
  horaAtencion: z.string(), // Ejemplo: "LUNES A SABADO - 8AM A 8PM"
  horaDomingo: z.string().nullable(), // Puede ser string o null. Ejemplo: "DOMINGOS DE 8:00 AM A 5:00 PM", null
  horaEntrega: z.null(), // En el ejemplo, siempre es null. Ajustar si puede tener otro valor.
  detalles: z.string(), // Puede contener texto o estar vacío. Ejemplo: "La carga pesada...", ""
  estadoAgencia: z.string().nullable(), // Puede ser string o null. Ejemplo: "ATENDIENDO EN ESTE MOMENTO", null
  nombre: z.string(), // Ejemplo: "AMAZONAS / CHACHAPOYAS / CHACHAPOYAS / CHACHAPOYAS CO DOS DE MAYO"
  lugarSobrescrito: z.string(), // Ejemplo: "CHACHAPOYAS CO DOS DE MAYO"
  tipoDestinoTerminal: z.string(), // Ejemplo: "destinos48", ""
  tipoConexionTerminal: z.string().nullable(), // Puede ser string, null o vacío. Ejemplo: null, ""
  estadoAgenteTerminal: z.string(), // Parece ser '0' u otro string. Ejemplo: "0"
  repartoHabilitadoTerminal: z.string().nullable(), // Puede ser '0', '1' o null. Ejemplo: "1", "0", null
  habilitadoOSTerminal: z.number(), // Parece ser 0 o 1. Ejemplo: 1, 0
  origen: z.number(), // Parece ser 0 o 1. Ejemplo: 1, 0
  destino: z.number(), // Parece ser 0 o 1. Ejemplo: 1, 0
  aereoTerminal: z.number(), // Parece ser 0 o 1. Ejemplo: 1, 0
  estadoProTerminal: z.string(), // Parece ser '0' u otro string. Ejemplo: "0"
  principalTerminal: z.number(), // Parece ser 0 o 1. Ejemplo: 0, 1
  internacionalTerminal: z.number(), // Parece ser 0 o 1. Ejemplo: 1, 0
  idDepartamento: z.number(), // Ejemplo: 1
  idProvincia: z.number(), // Ejemplo: 1
  idDistrito: z.number(), // Ejemplo: 1
  idUbicacion: z.number(), // Ejemplo: 10101
  origenesAereos: z.array(z.number()), // Un array de números. Ejemplo: [], [52, 504]
  destinosAereos: z.array(z.number()), // Un array de números. Ejemplo: [52], []
});

// Esquema para la respuesta completa de la API
const esquemaRespuestaApi = z.object({
  success: z.boolean(), // Ejemplo: true
  message: z.string(), // Ejemplo: "Lista de agencias."
  data: z.array(esquemaAgencia), // Un array que contiene objetos con la forma de 'esquemaAgencia'
});

// --- Cómo usarlo ---

// Suponiendo que tienes tu JSON en una variable llamada 'tuJson':
// const tuJson = {"success":true,"message":...}; // Tu JSON completo aquí

/*
try {
  // Intenta validar y parsear el JSON con el esquema principal
  const respuestaParseada = esquemaRespuestaApi.parse(tuJson);

  // Si llega aquí, el JSON es válido según el esquema
  // Ahora puedes usar 'respuestaParseada' con la seguridad de tipos de TypeScript/Zod
  // Por ejemplo, acceder a respuestaParseada.datos[i].idTerminal, etc.

} catch (error) {
  // Si el JSON no cumple con el esquema, Zod lanzará un error
  // Puedes inspeccionar el error para ver qué campo falló
}
*/

// Exportar los esquemas si los usarás en otros módulos
export { esquemaAgencia, esquemaRespuestaApi };

// Si quieres obtener el tipo inferido por Zod para usarlo en TypeScript:
export type Agencia = z.infer<typeof esquemaAgencia>;
export type RespuestaApi = z.infer<typeof esquemaRespuestaApi>;

/*
// Ejemplo de cómo usar el tipo inferido:
function procesarAgencia(agencia: Agencia) {
  // Procesar la agencia
}

function procesarRespuesta(respuesta: RespuestaApi) {
  if (respuesta.exito) {
    respuesta.datos.forEach(procesarAgencia);
  } else {
    // Manejar caso de error
  }
}

// Suponiendo que 'respuestaParseada' es el resultado de esquemaRespuestaApi.parse(tuJson)
// procesarRespuesta(respuestaParseada);
*/
