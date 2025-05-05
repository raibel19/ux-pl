import saveAs from 'file-saver';

/**
 * Converte un base64 en un pdf lo descarga.
 * @param base64Data
 * Base64
 * @param fileName
 * Nombre del pdf
 */
export const base64ToPdf = (base64Data: string, fileName: string) => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: 'application/pdf' });

  saveAs(blob, fileName);
};

export const base64ToBlob = (base64: string) => {
  const base64Split = base64.split(',');
  const type = base64Split[0].match(/:(.*?);/)?.[1];

  if (type) {
    const bs64 = base64Split[1];
    const byteCharacters = atob(bs64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    return {
      blob: new Blob([byteArray], { type }),
      type,
    };
  }
  return undefined;
};
