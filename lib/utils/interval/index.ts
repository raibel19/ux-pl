export const intervalManager = () => {
  const intervals = new Set<number>();

  /**
   * Crea un intervalo y lo guarda en un Set para ser manejado internamente.
   * @param callback
   * Funcion que se mandará a llamar cada que el intervalo de tiempo se cumpla.
   * @param delay
   * Tiempo que tendra cada intervalo.
   * @param args
   * Argumentos que se pueden pasar a window.setInterval.
   *
   * Este parámetro es opcional.
   * @returns
   * number (Id del intervalor)
   */
  const make = (callback: () => void, delay: number, ...args: unknown[]): number => {
    const newInterval = window.setInterval(callback, delay, ...args);
    intervals.add(newInterval);
    return newInterval;
  };

  /**
   * Elimina un intervalo segun su Id
   * @param id
   * Id del intervalo
   * @returns
   * void
   */
  const clear = (id: number): void => {
    intervals.delete(id);
    return clearInterval(id);
  };

  /**
   * Elimina todos los intervalos de tiempo guardados en el Set
   */
  const clearAll = (): void => {
    intervals.forEach((id) => {
      clear(id);
    });
  };

  return { intervals, make, clear, clearAll };
};
