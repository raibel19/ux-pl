export const convertToPixels = (value: string | number, parentElement: HTMLElement | null) => {
  if (typeof value === 'string') {
    // REM TO PX
    if (value.endsWith('rem')) {
      const remValue = parseFloat(value);
      return remValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    // EM TO PX
    if (value.endsWith('em')) {
      const emValue = parseFloat(value);
      return emValue * parseFloat(getComputedStyle(parentElement || document.body).fontSize);
    }
    // % TO PX
    if (value.endsWith('%')) {
      if (!parentElement) return parseFloat(value);
      const parentWidth = parentElement.clientWidth;
      return (parseFloat(value) / 100) * parentWidth;
    }
    // VH TO PX
    if (value.endsWith('vh')) {
      return (parseFloat(value) * window.innerHeight) / 100;
    }
    // VW TO PX
    if (value.endsWith('vw')) {
      return (parseFloat(value) * window.innerWidth) / 100;
    }
    // PX
    if (value.endsWith('px')) {
      return parseFloat(value);
    }
    // CM TO PX
    if (value.endsWith('cm')) {
      return parseFloat(value) * 37.7952755906;
    }
    // MM TO PX
    if (value.endsWith('mm')) {
      return parseFloat(value) * 3.77952755906;
    }
    // IN TO PX
    if (value.endsWith('in')) {
      return parseFloat(value) * 96;
    }
    // PT TO PX
    if (value.endsWith('pt')) {
      return parseFloat(value) * (96 / 72);
    }

    return parseFloat(value);
  }
  return value;
};
