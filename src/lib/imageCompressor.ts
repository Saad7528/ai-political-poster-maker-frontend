/**
 * Utility to compress and resize images client-side before sending to backend or saving in state.
 * Reduces 10MB+ camera photos to ~150KB while preserving pristine visual quality.
 */
export const compressImage = (
  dataUrlOrFile: string | File,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof dataUrlOrFile === 'string' && !dataUrlOrFile.startsWith('data:image')) {
      // Remote URL or standard path, return as is
      resolve(dataUrlOrFile);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const isPng = typeof dataUrlOrFile === 'string' && dataUrlOrFile.startsWith('data:image/png');
      const compressedDataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
    };

    if (typeof dataUrlOrFile === 'string') {
      img.src = dataUrlOrFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          resolve('');
        }
      };
      reader.readAsDataURL(dataUrlOrFile);
    }
  });
};
