import { blobToFile } from '../blob';
import { getMimeTypeFromExtension } from '../mime';

const urlGetExtension = (url: string) => {
  let ext = url.slice((Math.max(0, url.lastIndexOf('.')) || Infinity) + 1);
  ext = ext.split('?')[0];
  ext = ext.split('#')[0];
  ext = ext.split('&')[0];
  return ext;
};

export const urlToBlob = async (url: string) => {
  return await fetch(url).then((res) => res.blob());
};

export const urlToFile = async (url: string, fileName: string) => {
  return await fetch(url)
    .then((res) => {
      return res.blob();
    })
    .then((res) => {
      const ext = urlGetExtension(url);
      const mime = getMimeTypeFromExtension(ext);
      return blobToFile(res, fileName, mime);
    })
    .catch((err) => {
      console.log('Error al consultar el archivo', err);
      return undefined;
    });
};
