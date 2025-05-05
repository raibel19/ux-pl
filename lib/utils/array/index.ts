import { equals as objectEquals } from '../object';

/**
 * De un arreglo de strings regresa el primer valor que no sea blanco, null o undefined.
 * @param item
 * Arreglo de strings
 * @returns
 * string | undefined
 */
export const getFirstElementWithValueFromArray = (item: (string | undefined)[]): string | undefined => {
  let result = undefined;
  for (const element of item) {
    if (element && element !== '') {
      result = element;
      break;
    }
  }
  return result;
};
/**
 * Crea un arreglo de arreglos, en pocas palabras toma el arreglo que se envia y lo parte en la cantidad de arreglos que se especifica en "chunkSize".
 * @param array
 * Arreglo
 * @param chunkSize
 * Tamaño en que se partira el arreglo
 * @returns
 * T[][]
 */
export const chunkArray = <T>(array: T[], chunkSize: number) => {
  const chunkedArray: T[][] = [];
  let index = 0;

  while (index < array.length) {
    chunkedArray.push(array.slice(index, index + chunkSize));
    index += chunkSize;
  }

  return chunkedArray;
};
/**
 * Compara dos areglos
 * @note
 * Los objetos dentro de cada arreglo no deben de contener Funciones ni React.elements, para eliminar estos se puede utilizar "ObjectHelpers.removeFunctionsAndRectElements"
 * @param a1
 * Primer Arreglo
 * @param a2
 * Segundo Arreglo
 * @returns
 * boolean
 */
export const equals = <T>(a1: T[], a2: T[]) => {
  return (
    a1.length === a2.length &&
    a1.every(function (o: T, idx: number) {
      return objectEquals(o, a2[idx]);
    })
  );
};

export const minNumber = (array: number[]) => {
  let min = array[0];

  for (let i = 0; i < array.length; i++) {
    if (array[i] < min) {
      min = array[i];
    }
  }

  return min;
};

export const maxNumber = (array: number[]) => {
  let max = array[0];

  for (let i = 0; i < array.length; i++) {
    if (array[i] > max) {
      max = array[i];
    }
  }

  return max;
};

export const getByteArray = async (file: File): Promise<Uint8Array> => {
  const arrBuff = await file.arrayBuffer();
  return new Uint8Array(arrBuff);
};
