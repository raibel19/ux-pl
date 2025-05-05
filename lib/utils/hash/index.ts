const safeHash = (str: string, djb2: string): string => {
  const len = str.length;
  const first = str.charCodeAt(0) || 0;
  const last = str.charCodeAt(len - 1) || 0;
  return `${djb2}-${len}-${first}-${last}`;
};

export const djb2Hash = (str: string): string => {
  let hash = 5381;
  let i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  // Lo devolvés como string hexadecimal
  const djb2 = (hash >>> 0).toString(16);
  return safeHash(str, djb2);
};
