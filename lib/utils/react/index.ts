/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentProps, ComponentType, memo, RefObject } from 'react';

import { removeFunctionsAndRectElements } from '../object';

/**
 * Valida si el valor es un tipo de elemento de react.
 *
 * Ejemplo: React.element
 * @param value
 * Valor a validad
 * @returns
 * boolean
 */
export const isReactElement = (value: any): value is React.ReactElement => {
  return React.isValidElement(value);
};

/**
 * Filtra los objetos por key, si alguno es una Funcion o React.element, lo ignora.
 * @param obj
 * Objeto
 * @returns
 * Nuevo Objeto
 */
export const filterReactElements = (obj: Record<string, any>): Record<string, any> => {
  const newObj: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (!isReactElement(value) && typeof value !== 'function') {
        // Si no es un elemento React ni una función, lo añadimos al nuevo objeto
        if (typeof value === 'object' && value !== null) {
          // Si es un objeto, filtramos sus propiedades recursivamente
          newObj[key] = removeFunctionsAndRectElements(value);
        } else {
          newObj[key] = value;
        }
      }
    }
  }
  return newObj;
};

/**
 * 
 * En useRef, la propiedad current tiene su descriptor configurable establecido en false porque está diseñada para ser una referencia fija que no puede ser reconfigurada o eliminada una vez creada. Esto asegura que React pueda depender de que current siempre estará disponible y en una estructura específica en todo el ciclo de vida del componente. 
 * @param value 
 * @returns boolean
 * @example
 * 
  // 1. Referencia a un elemento HTML
  const videoRef = useRef<HTMLVideoElement>(null);
  // 2. Referencia a un número
  const numberRef = useRef<number>(42);
  // 3. Referencia a un objeto
  const objectRef = useRef({ key: 'value' });
  // 4. Referencia a un array
  const arrayRef = useRef([1, 2, 3]);
  // 5. Referencia a una función
  const functionRef = useRef(() => console.log('Hello'));
  // 6. Referencia a `null` (caso inicial)
  const nullRef = useRef(null);
  // 7. Referencia a un string
  const stringRef = useRef<string | null>('Hello World');
  // 8. Referencia a un booleano
  const booleanRef = useRef<boolean>(true);
  // 9. Referencia a un `Map`
  const mapRef = useRef(new Map());
  // 10. Referencia a un `Set`
  const setRef = useRef(new Set());
  // 1. Objeto con `current` apuntando a `null`
  const obj1 = { current: null };
  // 2. Objeto con `current` apuntando a un número
  const obj2 = { current: 42 };
  // 3. Objeto con `current` apuntando a un objeto
  const obj3 = { current: { key: 'value' } };
  // 4. Objeto con `current` apuntando a un array
  const obj4 = { current: [1, 2, 3] };
  // 5. Objeto con `current` apuntando a una función
  const obj5 = { current: () => console.log('Hello') };
  // 6. Objeto con `current` apuntando a un string
  const obj6 = { current: 'Hello World' };
  // 7. Objeto con `current` apuntando a un booleano
  const obj7 = { current: true };
  // 8. Objeto con `current` apuntando a un `Map`
  const obj8 = { current: new Map() };
  // 9. Objeto con `current` apuntando a un `Set`
  const obj9 = { current: new Set() };

  // Pruebas de estos objetos con `isReactRefElement`
    const refs = [
      videoRef,
      numberRef,
      objectRef,
      arrayRef,
      functionRef,
      nullRef,
      stringRef,
      booleanRef,
      mapRef,
      setRef,
      obj1,
      obj2,
      obj3,
      obj4,
      obj5,
      obj6,
      obj7,
      obj8,
      obj9,
    ];

    refs.forEach((ref, index) => {
      console.log(`ref ${index + 1} is React Ref:`, isReactRefElement(ref));
    });

    Resultado:
    ref 1 is React Ref: true
    ref 2 is React Ref: true
    ref 3 is React Ref: true
    ref 4 is React Ref: true
    ref 5 is React Ref: true
    ref 6 is React Ref: true
    ref 7 is React Ref: true
    ref 8 is React Ref: true
    ref 9 is React Ref: true
    ref 10 is React Ref: true
    ref 11 is React Ref: false
    ref 12 is React Ref: false
    ref 13 is React Ref: false
    ref 14 is React Ref: false
    ref 15 is React Ref: false
    ref 16 is React Ref: false
    ref 17 is React Ref: false
    ref 18 is React Ref: false
    ref 19 is React Ref: false
 */
export const isReactRefElement = (value: any): value is RefObject<any> => {
  if (!value || typeof value !== 'object') return false;

  const keys = Object.keys(value);
  if (keys.length !== 1 || !('current' in value)) return false;

  const descriptor = Object.getOwnPropertyDescriptor(value, 'current');
  if (!descriptor) return false;

  return (
    descriptor.configurable === false &&
    descriptor.enumerable === true &&
    descriptor.writable === true &&
    'value' in descriptor
  );
};

type PropsComparator<C extends ComponentType> = (
  prevProps: Readonly<ComponentProps<C>>,
  nextProps: Readonly<ComponentProps<C>>,
) => boolean;

/**
 * Funcion genérica para memorizar un componente que utiliza tipos genéricos o forwardRef.
 * @param Component
 * componente a memorizar
 * @param propsAreEqual
 * funcion para comparar las props ya que el memo de react solamente compara de forma muy superficiál.
 *
 * Nota: En este caso se puede usar la función de comparacion de objetos llamada "equals" que se encuentra dentro de Object/index.ts
 * @example
 * genericMemo(MyComponent, (prevProps, nextProps) => {
    return equals(prevProps, nextProps);
   })
 * @returns
 * component
 */
export function genericMemo<C extends ComponentType<any>>(Component: C, propsAreEqual?: PropsComparator<C>) {
  return memo(Component, propsAreEqual) as any as C;
}
