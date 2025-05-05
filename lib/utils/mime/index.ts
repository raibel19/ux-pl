export const getMimeTypeFromExtension = (extension: string) => {
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/vnd.microsoft.icon',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    psd: 'image/vnd.adobe.photoshop',
    heif: 'image/heif',
    heic: 'image/heic',
    avif: 'image/avif',
    jp2: 'image/jp2',
    jpx: 'image/jpx',
    j2k: 'image/j2k',
    jpf: 'image/jpx',
    hdr: 'image/vnd.radiance',
    ppm: 'image/x-portable-pixmap',
    pgm: 'image/x-portable-graymap',
    pbm: 'image/x-portable-bitmap',
    pnm: 'image/x-portable-anymap',
    xbm: 'image/x-xbitmap',
    xpm: 'image/x-xpixmap',
    dds: 'image/vnd.ms-dds',
    emf: 'image/emf',
    wmf: 'image/wmf',
    apng: 'image/apng',
    cur: 'image/x-icon', // Similar to ICO, but used for cursors
  };

  return mimeTypes[extension.toLowerCase()] || '';
};
