import { lib, SHA256 } from 'crypto-js';

export const fileToBase64 = (file: File): Promise<string> => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      const error = e.target?.error || e;
      const description = 'Error al convertir el File a base64';
      console.error(description, error);
      reject({ description, error });
    };
    reader.readAsDataURL(file);
  });
};

export const filesToBase64 = async (files: File[]) => {
  const filesArr: string[] = [];
  for (const file of files) {
    const bs64 = await fileToBase64(file);
    filesArr.push(bs64);
  }
  return filesArr;
};

export const fileHash = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrBuffer = e.target?.result as ArrayBuffer;
      const wordArray = lib.WordArray.create(arrBuffer);
      const hash = SHA256(wordArray).toString();
      resolve(hash);
    };
    reader.onerror = (e) => {
      const error = e.target?.error || e;
      const description = 'Error al generar el Hash';
      console.error(description, error);
      reject({ description, error });
    };
    reader.readAsArrayBuffer(file);
  });
};

export const cloneFile = (file: File): File => {
  return new File([file], file.name, { type: file.type });
};

export const createFileList = (files: File[]): FileList => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
};
