/**
 * Valida si el texto es un numerico
 * @param str
 * Texto a validar
 * @returns
 * boolean
 */
export const isNumeric = <T>(str: T) => {
  if (typeof str === 'number') {
    return true; // we only process strings!
  }

  if (typeof str !== 'string') {
    return false; // we only process strings!
  }

  // Elimina las comas si están presentes en la cadena.
  const newStr: string = str.replace(/,/g, '');

  return (
    !isNaN(Number(newStr)) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(newStr))
  ); // ...and ensure strings of whitespace fail
};

type Formatter = {
  format: (value: number | string) => string;
  parse: (value: string) => number;
};

export interface INumberFormatterOptions {
  /**
   * "localeToCurrency": Map que contiene el local junto con la moneda que utiliza cada uno.
   * ```ts
   * [
   *   ['es-AR', 'ARS'], ['es-BO', 'BOB'], ['pt-BR', 'BRL'], ['es-CL', 'CLP'],
   *   ['es-CO', 'COP'], ['es-CR', 'CRC'], ['es-CU', 'CUP'], ['es-DO', 'DOP'],
   *   ['es-EC', 'USD'], ['es-SV', 'USD'], ['es-GT', 'GTQ'], ['es-HN', 'HNL'],
   *   ['es-MX', 'MXN'], ['es-NI', 'NIO'], ['es-PA', 'PAB'], ['es-PY', 'PYG'],
   *   ['es-PE', 'PEN'], ['es-PR', 'USD'], ['es-UY', 'UYU'], ['es-VE', 'VES'],
   *   ['en-US', 'USD'], ['en-GB', 'GBP'], ['de-DE', 'EUR'], ['ja-JP', 'JPY'],
   *   ['es-ES', 'EUR']
   * ]
   * ```
   *
   * "getLocale()": obtiene los locales directo del navegador por default utiliza en-US si no encuentra algun local
   *
   * @default
   * localeToCurrency.get(getLocale())
   */
  locale?: Intl.LocalesArgument;
  /**
   * Opciones de configuración
   *
   * "localeToCurrency": Map que contiene el local junto con la moneda que utiliza cada uno.
   * ```ts
   * [
   *   ['es-AR', 'ARS'], ['es-BO', 'BOB'], ['pt-BR', 'BRL'], ['es-CL', 'CLP'],
   *   ['es-CO', 'COP'], ['es-CR', 'CRC'], ['es-CU', 'CUP'], ['es-DO', 'DOP'],
   *   ['es-EC', 'USD'], ['es-SV', 'USD'], ['es-GT', 'GTQ'], ['es-HN', 'HNL'],
   *   ['es-MX', 'MXN'], ['es-NI', 'NIO'], ['es-PA', 'PAB'], ['es-PY', 'PYG'],
   *   ['es-PE', 'PEN'], ['es-PR', 'USD'], ['es-UY', 'UYU'], ['es-VE', 'VES'],
   *   ['en-US', 'USD'], ['en-GB', 'GBP'], ['de-DE', 'EUR'], ['ja-JP', 'JPY'],
   *   ['es-ES', 'EUR']
   * ]
   * ```
   *
   * "getLocale()": obtiene los locales directo del navegador por default utiliza en-US si no encuentra algun local
   *
   * <strong style="color:red">Nota:</strong> Esta prop acepta toda la configuración de Intl.NumberFormat asi que si se requiere una configuración diferente puede leer la información de este.
   *
   * @default
   * {
   *    style: "decimal";
   *    minimumFractionDigits: 2;
   *    maximumFractionDigits: 2;
   *    currency: localeToCurrency.get(getLocale());
   * }
   */
  options?: Intl.NumberFormatOptions;
  /**
   * true: Los decimales se redondean
   *
   * false: no se redondean los decimales.
   * @default
   * true
   */
  roundDecimals?: boolean;
}

export const getLocale = () => {
  const localeDefault = 'en-US';

  if (typeof window !== 'undefined') {
    return Intl.NumberFormat().resolvedOptions().locale;
  }

  if (typeof navigator !== 'undefined') {
    const languages = navigator.languages as string[] | undefined;
    if (languages !== undefined && languages.length > 0) {
      return languages[0];
    }
    return navigator.language ?? localeDefault;
  }
  return localeDefault;
};

export const localeToCurrency = new Map<string, string>([
  ['es-AR', 'ARS'],
  ['es-BO', 'BOB'],
  ['pt-BR', 'BRL'],
  ['es-CL', 'CLP'],
  ['es-CO', 'COP'],
  ['es-CR', 'CRC'],
  ['es-CU', 'CUP'],
  ['es-DO', 'DOP'],
  ['es-EC', 'USD'],
  ['es-SV', 'USD'],
  ['es-GT', 'GTQ'],
  ['es-HN', 'HNL'],
  ['es-MX', 'MXN'],
  ['es-NI', 'NIO'],
  ['es-PA', 'PAB'],
  ['es-PY', 'PYG'],
  ['es-PE', 'PEN'],
  ['es-PR', 'USD'],
  ['es-UY', 'UYU'],
  ['es-VE', 'VES'],
  ['en-US', 'USD'],
  ['en-GB', 'GBP'],
  ['de-DE', 'EUR'],
  ['ja-JP', 'JPY'],
  ['es-ES', 'EUR'],
]);

const numberFormatterDefaults: INumberFormatterOptions = {
  locale: getLocale(),
  options: {
    currency: localeToCurrency.get(getLocale()),
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

const truncateDecimals = (num: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.trunc(num * factor) / factor;
};

export const numberFormatter = (config: INumberFormatterOptions = numberFormatterDefaults): Formatter => {
  const { locale, roundDecimals } = {
    ...numberFormatterDefaults,
    ...config,
  };

  const options = { ...numberFormatterDefaults.options, ...config.options };

  if (options.style === 'currency' && !options.currency) {
    throw new Error('Currency style requires a valid "currency" option.');
  }

  const numberFormat = new Intl.NumberFormat(locale, options);

  return {
    format: (value: number | string): string => {
      let numericValue = typeof value === 'string' ? parseFloat(value) : value;

      //Si roundDecimals es false no redondea, ya que por default numberFormat.format redondea los valores
      if (!roundDecimals && options.maximumFractionDigits !== undefined) {
        numericValue =
          options.style === 'percent'
            ? truncateDecimals(numericValue * 100, options.maximumFractionDigits) / 100
            : truncateDecimals(numericValue, options.maximumFractionDigits);
      }
      return isNumeric(numericValue) && !Number.isNaN(numericValue) ? numberFormat.format(numericValue) : '';
    },
    parse: (value: string): number => {
      const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));

      return isNumeric(numericValue) ? numericValue : NaN;
    },
  };
};
