/**
 * Parte un texto en la cantidad de carácteres especificados y agrega tres puntos al final.
 * @param source
 * Texto
 * @param size
 * Tamaño de carácteres que tendra el texto
 * @returns
 * string
 */
export const truncate = (source: string | undefined, size: number) => {
  if (!source) return source;
  return source.length > size ? source.slice(0, size - 1) + '…' : source;
};
/**
 * Elimina los puntos, comas y espacios en blanco de un texto.
 * @param str
 * Texto
 * @returns
 * string
 */
export const removeCharacters = (str: string) => {
  const regex = /[.,\s]/g;
  return str.replace(regex, '');
};
/**
 * Valida que un string no sea null, undefined o vacio
 * @param str texto a validar
 * @returns boolean
 */
export const isEmpty = (str: string | undefined) => {
  if (!str) return true;
  return str.trim().length === 0;
};
