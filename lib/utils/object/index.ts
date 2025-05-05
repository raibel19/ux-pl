/* eslint-disable @typescript-eslint/no-explicit-any */
import { isReactElement, filterReactElements, isReactRefElement } from '../react';

/**
 * Crea una copia del objeto, array, o valor
 * @param data
 * Objeto | Arreglo | valor
 * @returns
 * Objeto | Arreglo | valor
 */
export const deepCopy = <T>(data: T): T => JSON.parse(JSON.stringify(data));
/**
 * Actualiza un objeto segun su key
 * @param key
 * key del valor u objeto que se actualizará.
 * @param newValue
 * Nuevo valor u objeto que se actualizará segun el parámetro "key".
 * @param object
 * Objeto
 * @returns
 * Regresa el objeto del parámetro "object" con los datos actualizados.
 */
export const setValue = <k extends keyof I, I>(key: k, newValue: I[k], object: I): I => {
  return {
    ...object,
    [key]: {
      ...object[key],
      ...newValue,
    },
  };
};
/**
 * Crea un nuevo objeto removiendo funciones y React.elements dentro de un objeto.
 * @note
 * Esto puede ser utilil para comparar dos objetos ya sea con 'ObjectHelpers.equals' o convirtiendo los dos objetos en json y compararlos.
 * @param obj
 * Objeto
 * @returns
 * any
 */
export const removeFunctionsAndRectElements = (obj: any): any => {
  if (Array.isArray(obj)) {
    // Si es un arreglo, filtramos sus elementos recursivamente
    return obj.map((item) => removeFunctionsAndRectElements(item));
  } else if (typeof obj === 'object' && obj !== null) {
    // Si es un objeto, filtramos sus propiedades recursivamente
    return filterReactElements(obj);
  }
  return obj;
};
/**
 * Valida si existen referencias circulares excluyendo las propiedades "_owner" y "_self"
 * @param obj
 * Objeto
 * @param seen
 * Se encarga de ir guardando los objetos o valores, de esta forma mientras se recorre el objeto se valida contra este arreglo para saber si ya existe.
 * @returns
 * boolean
 */
export const hasCycles = (obj: any, seen: any[] = []): boolean => {
  if (obj && typeof obj === 'object') {
    const recursivePropsToExclude = [
      '_owner',
      '_self',
      '__NEXT_PAGE__',
      '_reactRootContainer',
      '__N_SSG',
      '__N_SSP',
      '__N_RSC',
      '__source',
    ];
    const reactPropsRegex = /^__(reactFiber|reactProps|reactEvents)\$/;

    if (seen.includes(obj)) {
      return true;
    }

    seen.push(obj);

    for (const key in obj) {
      if (recursivePropsToExclude.includes(key) || reactPropsRegex.test(key)) {
        return false;
      }

      //hasCycles(obj[key], seen)
      //  Verifica si el elemento en la posicion key ya existe en la lista si es asi significa que contiene dependencias circulares.
      //isReactRefElement(obj[key])
      //  Se verifica si el elemento en la posicion key es un elemento de tipo useRef ya que este tipo de elementos si contienen dependencias circulares
      //  aunque contenga dependencias circulares ignoraremos este tipo de elementos ya que se tiene una funcion "equalsReactRefElement" que se encarga de compararlos.
      //  por este echo regresaremos false cuando sean estos tipos.
      if (hasCycles(obj[key], seen) && !isReactRefElement(obj[key])) {
        return true;
      }
    }

    seen.pop();
  }

  return false;
};
/**
 * Valida si dos objetos de tipo React.element son iguales
 * @param reactElem1
 * React element 1
 * @param reactElem2
 * React element 2
 * @param customValid
 * Funcion en la cual pueden agregar una validacion extra segun se requiera.
 *
 * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 sean de tipo React.element
 * @returns
 * boolen
 */
export const equalsReactElement = (
  reactElem1: any,
  reactElem2: any,
  customValid?: (reactElem1: any, reactElem2: any) => boolean | undefined,
): boolean | undefined => {
  if (isReactElement(reactElem1) && isReactElement(reactElem2)) {
    const recursivePropsToExclude = [
      '_owner',
      '_self',
      '__NEXT_PAGE__',
      '_reactRootContainer',
      '__N_SSG',
      '__N_SSP',
      '__N_RSC',
      '__source',
    ];
    const reactPropsRegex = /^__(reactFiber|reactProps|reactEvents)\$/;

    if (customValid) {
      const equalsCustomValid = customValid(reactElem1, reactElem2);
      if (equalsCustomValid !== undefined) {
        return equalsCustomValid;
      }
    }

    if (reactElem1.type.toString() !== reactElem2.type.toString()) {
      return false;
    }

    const reactElem1IsObject = typeof reactElem1.props === 'object' && reactElem1.props !== null;
    const reactElem2IsObject = typeof reactElem2.props === 'object' && reactElem2.props !== null;

    if (!reactElem1IsObject && !reactElem2IsObject) {
      return undefined;
    }

    if (!reactElem1IsObject || !reactElem2IsObject) {
      return false;
    }

    const reactElem1Props = reactElem1.props as { [key: string]: any };
    const reactElem2Props = reactElem2.props as { [key: string]: any };

    const o1PropsKeys = Object.keys(reactElem1Props).filter(
      (key) => !recursivePropsToExclude.includes(key) && !reactPropsRegex.test(key),
    );

    const o2PropsKeys = Object.keys(reactElem2Props).filter(
      (key) => !recursivePropsToExclude.includes(key) && !reactPropsRegex.test(key),
    );

    if (o1PropsKeys.length !== o2PropsKeys.length) {
      return false;
    }

    if (!o1PropsKeys.length && !o2PropsKeys.length) {
      return true;
    } else if (!o1PropsKeys.length || !o2PropsKeys.length) {
      return false;
    }

    // if (!o1PropsKeys.length) {
    //   return reactElem1.type.toString() === reactElem2.type.toString();
    // }

    return o1PropsKeys.every((key) => {
      const o1CurrentProp = reactElem1Props[key];
      const o2CurrentProp = reactElem2Props[key];

      if (isReactElement(o1CurrentProp) && isReactElement(o2CurrentProp)) {
        return equals(o1CurrentProp, o2CurrentProp);
      } else if (isReactElement(o1CurrentProp) || isReactElement(o2CurrentProp)) {
        return false;
      }

      if (Array.isArray(o1CurrentProp)) {
        if (Array.isArray(o2CurrentProp) && o1CurrentProp.length === o2CurrentProp.length) {
          return o1CurrentProp.every((item, index) => {
            return equals(item, o2CurrentProp[index]);
          });
        }
        return false;
      } else if (typeof o1CurrentProp === 'object' && typeof o2CurrentProp === 'object') {
        return equals(o1CurrentProp, o2CurrentProp);
      }

      return o1CurrentProp === o2CurrentProp;
    });
  } else if (isReactElement(reactElem1) || isReactElement(reactElem2)) {
    return false;
  }
  return undefined;
};
/**
 *
 */
export const equalsReactRefElement = (
  reactRefElem1: any,
  reactRefElem2: any,
  customValid?: (reactRefElem1: any, reactRefElem2: any) => boolean | undefined,
): boolean | undefined => {
  if (isReactRefElement(reactRefElem1) && isReactRefElement(reactRefElem2)) {
    if (customValid) {
      const equalsCustomValid = customValid(reactRefElem1, reactRefElem2);
      if (equalsCustomValid !== undefined) {
        return equalsCustomValid;
      }
    }

    const o1Current = reactRefElem1.current;
    const o2Current = reactRefElem2.current;

    if (isReactRefElement(o1Current) && isReactRefElement(o2Current)) {
      return equals(o1Current, o2Current);
    } else if (isReactRefElement(o1Current) || isReactRefElement(o2Current)) {
      return false;
    }

    if (Array.isArray(o1Current)) {
      if (Array.isArray(o2Current) && o1Current.length === o2Current.length) {
        return o1Current.every((item, index) => {
          return equals(item, o2Current[index]);
        });
      }
      return false;
    } else if (
      (typeof o1Current === 'object' && typeof o2Current === 'object') ||
      (typeof o1Current === 'function' && typeof o2Current === 'function')
    ) {
      return equals(o1Current, o2Current);
    } else if (typeof o1Current === 'object' || typeof o2Current === 'object') {
      return false;
    }

    return o1Current === o2Current;
  } else if (isReactRefElement(reactRefElem1) || isReactRefElement(reactRefElem2)) {
    return false;
  }
  return undefined;
};
/**
   * Valida si dos funciones son iguales.
   * @param func1
   * Funcion 1
   * @param func2
   * Funcion 2
   * @param customValid
   * Funcion en la cual pueden agregar una validacion extra segun se requiera.
   *
   * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 sean de tipo function
   * @returns
   * boolen
   * @example
   * const func1 = () => console.log('Function 1');
    const func2 = () => console.log('Function 2');
    
    const isEqualsFunction = utils.object.equalsFuntion(
      func1,
      func2
    );
    returns: true
   */
export const equalsFuntion = <Func1 = any, Func2 = any>(
  func1: Func1,
  func2: Func2,
  customValid?: (func1: Func1, func2: Func2) => boolean | undefined,
): boolean | undefined => {
  if (typeof func1 === 'function' && typeof func2 === 'function') {
    // const replace = /(\.\.\.oo_oo\s*\(\s*")[0-9_]+("\s*,)/g;

    if (customValid) {
      const equalsCustomValid = customValid(func1, func2);
      if (equalsCustomValid !== undefined) {
        return equalsCustomValid;
      }
    }

    const f1AsGenericFunc = func1 as (...args: any[]) => any; // Castear a tipo función genérico
    const f2AsGenericFunc = func2 as (...args: any[]) => any; // Castear a tipo función genérico
    if (f1AsGenericFunc === f2AsGenericFunc) {
      return true;
    }
    return false;

    // const f1 = func1.toString().replace(replace, '$1DYNAMIC_NUMBER$2');
    // const f2 = func2.toString().replace(replace, '$1DYNAMIC_NUMBER$2');
    // return f1 === f2;
  } else if (typeof func1 === 'function' || typeof func2 === 'function') {
    return false;
  }
  return undefined;
};
/**
   * Valida si dos fechas de tipo Date son iguales.
   * @param date1
   * Fecha 1
   * @param date2
   * Fecha 2
   * @param customValid
   * Funcion en la cual pueden agregar una validacion extra segun se requiera.
   *
   * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 sean una instancia de Date
   * @returns
   * boolen
   * @example
   * const date1 = new Date('2022-01-01');
    const date2 = new Date('2022-01-01');
    
    const isEqualsDate = utils.object.equalsDate(date1, date2);
    result: true
   */
export const equalsDate = <Date1 = any, Date2 = any>(
  date1: Date1,
  date2: Date2,
  customValid?: (date1: Date1, date2: Date2) => boolean | undefined,
): boolean | undefined => {
  if (date1 instanceof Date && date2 instanceof Date) {
    if (customValid) {
      const equalsCustomValid = customValid(date1, date2);
      if (equalsCustomValid !== undefined) {
        return equalsCustomValid;
      }
    }

    return date1.getTime() === date2.getTime();
  } else if (date1 instanceof Date || date2 instanceof Date) {
    return false;
  }
  return undefined;
};
/**
   * Valida si dos objetos de tipo Map son iguales
   * @param map1
   * Map 1
   * @param map2
   * Map 2
   * @param customValid
   * Funcion en la cual pueden agregar una validacion extra segun se requiera.
   *
   * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 sean una instancia de Map
   * @returns
   * boolen
   * @example
   * const map1 = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);
  
    const map2 = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);
  
    const isEqualsMap = utils.object.equalsMap(map1, map2);
    result: true
   */
export const equalsMap = <Map1 extends object = any, Map2 extends object = any>(
  map1: Map1,
  map2: Map2,
  customValid?: (map1: Map1, map2: Map2) => boolean | undefined,
): boolean | undefined => {
  if (typeof map1 === 'object' && typeof map2 === 'object') {
    if (map1 && map2 && map1.constructor !== map2.constructor) {
      return false;
    }

    if (map1 instanceof Map && map2 instanceof Map) {
      if (customValid) {
        const equalsCustomValid = customValid(map1, map2);
        if (equalsCustomValid !== undefined) {
          return equalsCustomValid;
        }
      }

      if (map1.size !== map2.size) {
        return false;
      }

      for (const [key, value] of map1.entries()) {
        if (!map2.has(key)) {
          return false;
        }
        if (!equals(value, map2.get(key))) {
          return false;
        }
      }

      return true;
    } else if (map1 instanceof Map || map2 instanceof Map) {
      return false;
    }
  } else if (typeof map1 === 'object' || typeof map2 === 'object') {
    return false;
  }
  return undefined;
};
/**
   * Valida si dos objetos de tipo Set son iguales
   * @param set1
   * Set 1
   * @param set2
   * Set 2
   * @param customValid
   * Funcion en la cual pueden agregar una validacion extra segun se requiera.
   *
   * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 sean una instancia de Set
   * @returns
   * boolean
   * @example
   * const set1 = new Set([
      1,
      2,
      () => {
        const p = '';
      },
      {
        value1: 'value1',
        value2: () => {
          const value21 = '';
        },
        value3: {
          p: '',
          p2: '',
          p3: <CardContainer></CardContainer>,
        },
      },
    ]);
    const set2 = new Set([
      1,
      2,
      () => {
        const p = '';
      },
      {
        value1: 'value1',
        value2: () => {
          const value21 = '';
        },
        value3: {
          p: '',
          p2: '',
          p3: <CardContainer></CardContainer>,
        },
      },
    ]);
  
    const isEqualsSet = utils.object.equalsSet(set1, set2);
    result: true
   */
export const equalsSet = <Set1 extends object = any, Set2 extends object = any>(
  set1: Set1,
  set2: Set2,
  customValid?: (set1: Set1, set2: Set2) => boolean | undefined,
): boolean | undefined => {
  if (typeof set1 === 'object' && typeof set2 === 'object') {
    if (set1 && set2 && set1.constructor !== set2.constructor) {
      return false;
    }

    if (set1 instanceof Set && set2 instanceof Set) {
      if (customValid) {
        const equalsCustomValid = customValid(set1, set2);
        if (equalsCustomValid !== undefined) {
          return equalsCustomValid;
        }
      }

      if (set1.size !== set2.size) {
        return false;
      }

      const o1SetArray = Array.from(set1);
      for (const [index, value] of o1SetArray.entries()) {
        if (!set2.has(value) && typeof value !== 'function' && typeof value !== 'object') {
          return false;
        }

        if (typeof value === 'function' || typeof value === 'object') {
          const o2SetArray = Array.from(set2);

          if (!equals(value, o2SetArray[index])) {
            return false;
          }
        }
      }
      return true;
    } else if (set1 instanceof Set || set2 instanceof Set) {
      return false;
    }
  } else if (typeof set1 === 'object' || typeof set2 === 'object') {
    return false;
  }
  return undefined;
};
/**
   * Valida si dos ArrayBuffer son iguales
   * @param arrayB1
   * Array Buffer 1
   * @param arrayB2
   * Array Buffer 2
   * @param customValid
   * Funcion en la cual pueden agregar una validacion extra segun se requiera.
   *
   * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 sean una instancia de ArrayBuffer
   * @returns
   * boolean
   * @example
   * const buffer1 = new ArrayBuffer(8);
    const buffer2 = new ArrayBuffer(8);
  
    const isEqualsArrayBuffer2 = utils.object.equalsArrayBuffer(
      buffer1,
      buffer2
    );
    result: true
   */
export const equalsArrayBuffer = <ArrayB1 extends object = any, ArrayB2 extends object = any>(
  arrayB1: ArrayB1,
  arrayB2: ArrayB2,
  customValid?: (arrayB1: ArrayB1, arrayB2: ArrayB2) => boolean | undefined,
): boolean | undefined => {
  if (typeof arrayB1 === 'object' && typeof arrayB2 === 'object') {
    if (arrayB1 && arrayB2 && arrayB1.constructor !== arrayB2.constructor) {
      return false;
    }

    if (arrayB1 instanceof ArrayBuffer && arrayB2 instanceof ArrayBuffer) {
      if (customValid) {
        const equalsCustomValid = customValid(arrayB1, arrayB2);
        if (equalsCustomValid !== undefined) {
          return equalsCustomValid;
        }
      }

      if (arrayB1.byteLength !== arrayB2.byteLength) {
        return false;
      }

      const o1IntArray = new DataView(arrayB1);
      const o2IntArray = new DataView(arrayB2);

      let i = arrayB1.byteLength;
      while (i--) {
        if (o1IntArray.getUint8(i) !== o2IntArray.getUint8(i)) {
          return false;
        }
      }

      return true;
    } else if (arrayB1 instanceof ArrayBuffer || arrayB2 instanceof ArrayBuffer) {
      return false;
    }
  } else if (typeof arrayB1 === 'object' || typeof arrayB2 === 'object') {
    return false;
  }
  return undefined;
};
/**
   * Valida si dos objetos de tipo Regex son iguales
   * @param regex1
   * Regex 1
   * @param regex2
   * Regex 2
   * @param customValid
   * Funcion en la cual pueden agregar una validacion extra segun se requiera.
   *
   * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 sean una instancia de RegExp
   * @returns
   * boolean
   * @example
   * const regex1 = /^abc$/i;
    const regex2 = new RegExp('^abc$', 'i');
    
    const isEqualsRegex = utils.object.equalsRegexp(regex1, regex2);
    result: true
   */
export const equalsRegexp = <Regex1 extends object = any, Regex2 extends object = any>(
  regex1: Regex1,
  regex2: Regex2,
  customValid?: (regex1: Regex1, regex2: Regex2) => boolean | undefined,
): boolean | undefined => {
  if (typeof regex1 === 'object' && typeof regex2 === 'object') {
    if (regex1 && regex2 && regex1.constructor !== regex2.constructor) {
      return false;
    }

    if (regex1 instanceof RegExp && regex2 instanceof RegExp) {
      if (customValid) {
        const equalsCustomValid = customValid(regex1, regex2);
        if (equalsCustomValid !== undefined) {
          return equalsCustomValid;
        }
      }

      return regex1.source === regex2.source && regex1.flags === regex2.flags;
    } else if (regex1 instanceof RegExp || regex2 instanceof RegExp) {
      return false;
    }
  } else if (typeof regex1 === 'object' || typeof regex2 === 'object') {
    return false;
  }
  return undefined;
};
/**
   * Valida si dos objetos son iguales
   * @param object1
   * Objeto 1
   * @param object2
   * Objeto 2
   * @param customValid
   * Funcion en la cual pueden agregar una validacion extra segun se requiera.
   *
   * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 sean de tipo objeto y despues de validad el constructor de ambos objetos.
   *
   * Los objetos no enumerados como el File, Blob, WeakMap, WeakSet, DOM Elements y TypedArray no se verifican propiedad por propiedad ya que estas no pertenecen al objeto, por lo tanto se intenta obtener los keys de los objetos y si los dos son objetos con propiedades no enumeradas regresa true (que quiere decir que el primer objeto es identico al segundo aunque internamente alguna propiedad tenga un valor diferente ), en caso contrario al terner un objeto propiedades enumeradas y otro no , siempre regresa un false, solamente se validan los objetos cuyas propiedades esten enumerdas.
   * 
   * Estas validaciones se hacen en estas lineas:
   * 
   * if (o1Keys.length !== o2Keys.length) {
        return false;
      }
  
      if (!o1Keys.length && !o2Keys.length) {
        return true;
      } else if (!o1Keys.length || !o2Keys.length) {
        return false;
      }
   * 
   * A parte de File, Blob, WeakMap, WeakSet, DOM Elements y TypedArray existen otros objetos no enumerados Date, Map, Set, ArrayBuffer los cuales ya tienen sus propios metodos para validar.
   * @returns
   * boolean
   */
export const equalsObject = (
  object1: any,
  object2: any,
  customValid?: (object1: any, object2: any) => boolean | undefined,
): boolean | undefined => {
  if (typeof object1 === 'object' && typeof object2 === 'object') {
    const recursivePropsToExclude = [
      '_owner',
      '_self',
      '__NEXT_PAGE__',
      '_reactRootContainer',
      '__N_SSG',
      '__N_SSP',
      '__N_RSC',
      '__source',
    ];
    const reactPropsRegex = /^__(reactFiber|reactProps|reactEvents)\$/;

    if (object1 === null || object1 === undefined || object2 === null || object2 === undefined) {
      return object1 === object2;
    }

    if (object1?.constructor !== object2?.constructor) {
      return false;
    }

    if (customValid) {
      const equalsCustomValid = customValid(object1, object2);
      if (equalsCustomValid !== undefined) {
        return equalsCustomValid;
      }
    }

    const o1Keys = Object.keys(object1).filter(
      (key) => !recursivePropsToExclude.includes(key) && !reactPropsRegex.test(key),
    );
    const o2Keys = Object.keys(object2).filter(
      (key) => !recursivePropsToExclude.includes(key) && !reactPropsRegex.test(key),
    );

    if (o1Keys.length !== o2Keys.length) {
      return false;
    }

    if (!o1Keys.length && !o2Keys.length) {
      return true;
    } else if (!o1Keys.length || !o2Keys.length) {
      return false;
    }

    return o1Keys.every((key) => {
      const o1Current = object1[key];
      const o2Current = object2[key];

      if (Array.isArray(o1Current)) {
        if (Array.isArray(o2Current) && o1Current.length === o2Current.length) {
          return o1Current.every((item, index) => {
            return equals(item, o2Current[index]);
          });
        }
        return false;
      } else if (
        (typeof o1Current === 'object' && typeof o2Current === 'object') ||
        (typeof o1Current === 'function' && typeof o2Current === 'function')
      ) {
        return equals(o1Current, o2Current);
      }

      return o1Current === o2Current;
    });
  } else if (typeof object1 === 'object' || typeof object2 === 'object') {
    return false;
  }

  return undefined;
};
/**
 * Valida si dos elementos son iguales, ya sea React.element, Function, Date, Map, Set, ArrayBuffer, Regex, Object y tipos de datos primitivos.
 * @param object1
 * Objeto o Valor 1
 * @param object2
 * Objeto o Valor 2
 * @param customValid
 * Funcion en la cual pueden agregar una validacion extra segun se requiera.
 *
 * Esta funcion se ejecuta despues de verificar que tanto el parametro 1 y 2 no sean null o undefined
 * @returns
 * boolean
 */
export const equals = (
  object1: any,
  object2: any,
  customValid?: (object1: any, object2: any) => boolean | undefined,
): boolean => {
  if (object1 === null || object1 === undefined || object2 === null || object2 === undefined) {
    return object1 === object2;
  }

  if (customValid) {
    const equalsCustomValid = customValid(object1, object2);
    if (equalsCustomValid !== undefined) {
      return equalsCustomValid;
    }
  }

  const equalsReactElementResult = equalsReactElement(object1, object2);
  if (equalsReactElementResult !== undefined) {
    return equalsReactElementResult;
  }

  const equalsReactRefElementResult = equalsReactRefElement(object1, object2);
  if (equalsReactRefElementResult !== undefined) {
    return equalsReactRefElementResult;
  }

  const equalsFuntionResult = equalsFuntion(object1, object2);
  if (equalsFuntionResult !== undefined) {
    return equalsFuntionResult;
  }

  const equalsDateResult = equalsDate(object1, object2);
  if (equalsDateResult !== undefined) {
    return equalsDateResult;
  }

  const isCyclesResult = hasCycles(object1);
  if (isCyclesResult) {
    console.log('isCycles', { object1, isCyclesResult });
    return true;
  }

  const equalsMapResult = equalsMap(object1, object2);
  if (equalsMapResult !== undefined) {
    return equalsMapResult;
  }

  const equalsSetResult = equalsSet(object1, object2);
  if (equalsSetResult !== undefined) {
    return equalsSetResult;
  }

  const equalsArrayBufferResult = equalsArrayBuffer(object1, object2);
  if (equalsArrayBufferResult !== undefined) {
    return equalsArrayBufferResult;
  }

  const equalsRegexpResult = equalsRegexp(object1, object2);
  if (equalsRegexpResult !== undefined) {
    return equalsRegexpResult;
  }

  const equalsObjectResult = equalsObject(object1, object2);
  if (equalsObjectResult !== undefined) {
    return equalsObjectResult;
  }

  return object1 === object2;
};
