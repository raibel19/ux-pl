export const blobToFile = (blob: Blob, fileName: string, type: string) => {
  return new File([blob], fileName, { type });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      const error = e.target?.error || e;
      const description = 'Error al convertir el blob a base64';
      console.error(description, error);
      reject({ description, error });
    };
    reader.readAsDataURL(blob);
  });
};
