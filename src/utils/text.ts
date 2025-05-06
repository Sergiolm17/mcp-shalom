/**
 * Utility functions for text processing
 */

/**
 * Normaliza una cadena de texto eliminando acentos y convirtiendo a minúsculas
 * para hacer búsquedas insensibles a mayúsculas/minúsculas y acentos
 */
export const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};
