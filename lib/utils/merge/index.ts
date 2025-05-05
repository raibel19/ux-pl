import { equals as equalsArray } from '../array';
import {
  equals,
  equalsArrayBuffer,
  equalsDate,
  equalsFuntion,
  equalsMap,
  equalsRegexp,
  equalsSet,
  hasCycles,
} from '../object';
import { isReactElement } from '../react';

interface IMergeOptions {
  maxDepth?: number;
  deepMergeArrays?: boolean;
  deepMergeObjects?: boolean;
  getDefaultForUndefined?: boolean;
  getDefaultForNull?: boolean;
  // defaults?:{
  //   array: {
  //     key: string;
  //     all?: boolean;
  //     index: number;
  //     data: any
  //   }[]
  // }
}

type Nullable<T> = T | null | undefined;
type NullableArray<T> = T[] | null | undefined;
type Jsonable<T> =
  | string
  | number
  | boolean
  | null
  | undefined
  | Nullable<T>
  | NullableArray<T>
  | readonly Jsonable<T>[]
  | { readonly [key: string]: Jsonable<T> }
  | { toJSON(): Jsonable<T> };

class BaseError<T> extends Error {
  public readonly context?: Jsonable<T>;

  constructor(message: string, options: { cause?: unknown; error?: Error; context?: Jsonable<T> } = {}) {
    const { cause, context } = options;

    super(message, { cause });
    this.name = this.constructor.name;
    this.context = context;
  }
}

const handleError = (value: unknown) => {
  if (value instanceof Error) return value;

  let stringified = '[Unable to stringify the thrown value]';
  try {
    stringified = JSON.stringify(value);
  } catch {
    /* empty */
  }

  const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`);
  return error;
};

const mergePrimitive = <T>(defaults: Nullable<T>, value: Nullable<T>, oldValue: Nullable<T>) => {
  const valueType = typeof value;
  const oldValueType = typeof oldValue;
  const defualtsType = typeof defaults;

  if (valueType === 'number') {
    if (oldValueType === 'number' && equals(value, oldValue)) return oldValue;
    return value;
  } else if (valueType === 'string') {
    if (oldValueType === 'string' && equals(value, oldValue)) return oldValue;
    return value;
  } else if (valueType === 'boolean') {
    if (oldValueType === 'boolean' && equals(value, oldValue)) return oldValue;
    return value;
  } else if (valueType === 'bigint') {
    if (oldValueType === 'bigint' && equals(value, oldValue)) return oldValue;
    return value;
  } else if (
    defualtsType === 'number' ||
    defualtsType === 'string' ||
    defualtsType === 'boolean' ||
    defualtsType === 'bigint'
  ) {
    return defaults;
  }
  return undefined;
};

const mergeFuncton = <T>(defaults: Nullable<T>, value: Nullable<T>, oldValue: Nullable<T>) => {
  const valueIsFunc = typeof value === 'function';
  const oldValueIsFunc = typeof oldValue === 'function';
  const defaultsIsFunc = typeof defaults === 'function';

  if (valueIsFunc && oldValueIsFunc) {
    return equalsFuntion(value, oldValue) ? oldValue : value;
  } else if (valueIsFunc) {
    return value;
  } else if (defaultsIsFunc) {
    return defaults;
  }
  return undefined;
};

const mergeDate = <T>(defaults: Nullable<T>, value: Nullable<T>, oldValue: Nullable<T>) => {
  const valueIsDate = value instanceof Date;
  const oldValueIsDate = oldValue instanceof Date;
  const defaultsIsDate = defaults instanceof Date;

  if (valueIsDate && oldValueIsDate) {
    return equalsDate(value, oldValue) ? oldValue : value;
  } else if (valueIsDate) {
    return value;
  } else if (defaultsIsDate) {
    return defaults;
  }
  return undefined;
};

const mergeMap = <T>(defaults: Nullable<T>, value: Nullable<T>, oldValue: Nullable<T>) => {
  const valueIsMap = value instanceof Map;
  const oldValueIsMap = oldValue instanceof Map;
  const defaultsIsMap = defaults instanceof Map;

  if (valueIsMap && oldValueIsMap) {
    return equalsMap(value, oldValue) ? oldValue : value;
  } else if (valueIsMap) {
    return value;
  } else if (defaultsIsMap) {
    return defaults;
  }
  return undefined;
};

const mergeSet = <T>(defaults: Nullable<T>, value: Nullable<T>, oldValue: Nullable<T>) => {
  const valueIsSet = value instanceof Set;
  const oldValueIsSet = oldValue instanceof Set;
  const defaultsIsSet = defaults instanceof Set;

  if (valueIsSet && oldValueIsSet) {
    return equalsSet(value, oldValue) ? oldValue : value;
  } else if (valueIsSet) {
    return value;
  } else if (defaultsIsSet) {
    return defaults;
  }
  return undefined;
};

const mergeArrayBuffer = <T>(defaults: Nullable<T>, value: Nullable<T>, oldValue: Nullable<T>) => {
  const valueIsArrayBuffer = value instanceof ArrayBuffer;
  const oldValueIsArrayBuffer = oldValue instanceof ArrayBuffer;
  const defaultsIsArreyBuffer = defaults instanceof ArrayBuffer;

  if (valueIsArrayBuffer && oldValueIsArrayBuffer) {
    return equalsArrayBuffer(value, oldValue) ? oldValue : value;
  } else if (valueIsArrayBuffer) {
    return value;
  } else if (defaultsIsArreyBuffer) {
    return defaults;
  }
  return undefined;
};

const mergeRegexp = <T>(defaults: Nullable<T>, value: Nullable<T>, oldValue: Nullable<T>) => {
  const valueIsRegexp = value instanceof RegExp;
  const oldValueIsRegexp = oldValue instanceof RegExp;
  const defaultsIsRegexp = defaults instanceof RegExp;

  if (valueIsRegexp && oldValueIsRegexp) {
    return equalsRegexp(value, oldValue) ? oldValue : value;
  } else if (valueIsRegexp) {
    return value;
  } else if (defaultsIsRegexp) {
    return defaults;
  }
  return undefined;
};

const mergeArray = <T>(
  defaults: NullableArray<T>,
  value: NullableArray<T>,
  oldValue: NullableArray<T>,
  deepMergeArrays: boolean,
) => {
  const valueIsArray = Array.isArray(value);
  const oldValueIsArray = Array.isArray(oldValue);
  const defaultsIsArray = Array.isArray(defaults);

  if (valueIsArray && defaultsIsArray && defaults.length > 0) {
    const maxLength = Math.max(value.length, defaults.length);
    const valuesCombine: Array<T> = [];

    for (let idx = 0; idx < maxLength; idx++) {
      const valueIdxExiste = idx in value;
      const defaultIdxExiste = idx in defaults;

      if (valueIdxExiste) {
        valuesCombine.push(value[idx]);
      } else if (defaultIdxExiste && deepMergeArrays) {
        valuesCombine.push(defaults[idx]);
      }
    }

    const combine = valuesCombine.reduce<T[]>((acc, item, idx) => {
      const currentDefault = defaults[idx];
      const currentOldValue = oldValueIsArray ? oldValue[idx] : undefined;

      if (item === undefined || item === null) {
        acc.push(currentDefault);
      } else {
        const _merge = merge(currentDefault, item, currentOldValue);
        if (Array.isArray(_merge)) {
          acc.push(_merge as T);
        } else {
          acc.push(_merge as T);
        }
      }
      return acc;
    }, []);
    return combine;
  } else if (valueIsArray && oldValueIsArray) {
    return equalsArray(value, oldValue) ? oldValue : value;
  } else if (valueIsArray) {
    return value;
  } else if (defaultsIsArray) {
    return defaults;
  }
  return undefined;
};

const mergeRecursive = <T>(
  keys: Set<string>,
  defaults: Nullable<T>,
  value: Nullable<T>,
  oldValue: Nullable<T>,
  options: Required<Omit<IMergeOptions, 'maxDepth'>>,
) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newModel: any = {};
  const { deepMergeArrays, getDefaultForNull, getDefaultForUndefined } = options;

  for (const key of keys) {
    if (recursivePropsToExclude.includes(key) || reactPropsRegex.test(key)) continue;

    const currentValue = value?.[key as keyof T];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentOldValue: any = oldValue?.[key as keyof T];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentDefaults: any = defaults?.[key as keyof T];

    if (isReactElement(currentValue) || currentValue instanceof File || currentValue instanceof Blob) {
      newModel[key] = currentValue;
      continue;
    }

    if (currentValue === undefined) {
      newModel[key] = getDefaultForUndefined ? currentDefaults : currentValue;
      continue;
    }
    if (currentValue === null) {
      newModel[key] = getDefaultForNull ? currentDefaults : currentValue;
      continue;
    }

    //SE VALIDAN DEPENDENCIAS CIRCULARES
    if (hasCycles(currentValue)) {
      console.warn('Existe dependencias circulares en', currentValue);
      newModel[key] = currentValue;
      continue;
    }

    if (value !== null && typeof value === 'object' && key in value === false) {
      newModel[key] = currentDefaults;
      continue;
    }

    const currentValueType = typeof currentValue;

    if (currentValueType === 'number' || currentValueType === 'string' || currentValueType === 'boolean') {
      newModel[key] = mergePrimitive<typeof currentValue>(currentDefaults, currentValue, currentOldValue);
      continue;
    }

    if (Array.isArray(currentValue)) {
      newModel[key] = mergeArray<typeof currentValue>(
        Array.isArray(currentDefaults) ? currentDefaults : undefined,
        currentValue,
        Array.isArray(currentOldValue) ? currentOldValue : undefined,
        deepMergeArrays,
      ) as unknown as Nullable<typeof currentValue>;
      continue;
    }

    if (currentValue instanceof Date) {
      newModel[key] = mergeDate<typeof currentValue>(currentDefaults, currentValue, currentOldValue);
      continue;
    } else if (currentValue instanceof Map) {
      newModel[key] = mergeMap<typeof currentValue>(currentDefaults, currentValue, currentOldValue);
      continue;
    } else if (currentValue instanceof Set) {
      newModel[key] = mergeSet<typeof currentValue>(currentDefaults, currentValue, currentOldValue);
      continue;
    } else if (currentValue instanceof ArrayBuffer) {
      newModel[key] = mergeArrayBuffer<typeof currentValue>(currentDefaults, currentValue, currentOldValue);
      continue;
    } else if (currentValue instanceof RegExp) {
      newModel[key] = mergeRegexp<typeof currentValue>(currentDefaults, currentValue, currentOldValue);
      continue;
    }

    if (currentValueType === 'object' && currentValue !== null) {
      newModel[key] = merge<typeof currentValue>(currentDefaults, currentValue, currentOldValue, options);
      continue;
    }

    if (currentValueType === 'function') {
      newModel[key] = mergeFuncton<typeof currentValue>(currentDefaults, currentValue, currentOldValue);
      continue;
    }

    if (oldValue && !equals(currentValue, currentOldValue)) {
      newModel[key] = currentValue;
      continue;
    } else if (oldValue && equals(currentValue, currentOldValue)) {
      newModel[key] = currentOldValue;
      continue;
    } else {
      newModel[key] = currentValue === '' ? currentValue : currentValue || currentDefaults;
      continue;
    }
  }
  return newModel as T;
};

const mergeObject = <T>(
  defaults: Nullable<T>,
  value: Nullable<T>,
  oldValue: Nullable<T>,
  options: Required<Omit<IMergeOptions, 'maxDepth'>>,
) => {
  const valueIsObject = value !== null && typeof value === 'object';
  const oldValueIsObject = oldValue !== null && typeof oldValue === 'object';
  const defaultsIsObject = defaults !== null && typeof defaults === 'object';

  const valueKeys = new Set<string>([
    ...Object.keys((options.deepMergeObjects ? defaults : {}) || {}),
    ...Object.keys(value || {}),
  ]);

  if (!valueKeys.size) return value; // como value y defaults no tienen ninguna key regresamos value porque tiene el mismo tipo T

  return mergeRecursive<T>(
    valueKeys,
    defaultsIsObject ? defaults : undefined,
    valueIsObject ? value : undefined,
    oldValueIsObject ? oldValue : undefined,
    options,
  );
};

export const merge = <T>(
  defaults: Nullable<T>,
  value: T,
  oldValue: Nullable<T>,
  options: IMergeOptions = {
    maxDepth: 10,
    deepMergeArrays: false,
    deepMergeObjects: true,
    getDefaultForNull: false,
    getDefaultForUndefined: true,
  },
) => {
  try {
    const {
      deepMergeArrays = false,
      deepMergeObjects = true,
      getDefaultForNull = false,
      getDefaultForUndefined = true,
    } = options;

    if (isReactElement(value) || value instanceof File || value instanceof Blob) return value;

    if (value === undefined) return getDefaultForUndefined ? defaults : value;
    if (value === null) return getDefaultForNull ? defaults : value;

    //SE VALIDAN DEPENDENCIAS CIRCULARES
    if (hasCycles(value)) {
      console.warn('Existe dependencias circulares en', value);
      return value;
    }

    const valueType = typeof value;

    if (valueType === 'number' || valueType === 'string' || valueType === 'boolean' || valueType === 'bigint') {
      return mergePrimitive<T>(defaults, value, oldValue);
    }

    if (Array.isArray(value)) {
      return mergeArray<T>(
        Array.isArray(defaults) ? defaults : undefined,
        value as NullableArray<T>,
        Array.isArray(oldValue) ? oldValue : undefined,
        deepMergeArrays,
      ) as unknown as Nullable<T>;
    }

    if (value instanceof Date) {
      return mergeDate<T>(defaults, value, oldValue);
    } else if (value instanceof Map) {
      return mergeMap<T>(defaults, value, oldValue);
    } else if (value instanceof Set) {
      return mergeSet<T>(defaults, value, oldValue);
    } else if (value instanceof ArrayBuffer) {
      return mergeArrayBuffer<T>(defaults, value, oldValue);
    } else if (value instanceof RegExp) {
      return mergeRegexp<T>(defaults, value, oldValue);
    }

    if (valueType === 'object' && value !== null) {
      return mergeObject<T>(defaults, value, oldValue, {
        deepMergeArrays,
        deepMergeObjects,
        getDefaultForNull,
        getDefaultForUndefined,
      });
    }

    if (valueType === 'function') {
      return mergeFuncton<T>(defaults, value, oldValue);
    }

    if (!equals(value, oldValue)) {
      return value;
    } else if (oldValue !== undefined && oldValue !== null && equals(value, oldValue)) {
      return oldValue;
    }

    return defaults;
  } catch (err) {
    // const { message, name, cause, stack } = handleError(err);
    // console.warn('Error', { message, name, cause, stack });
    const error = handleError(err);

    throw new BaseError('Ah ocurrido un error al generar el merge', {
      cause: error,
      context: { defaults, value },
    });
  }
};
