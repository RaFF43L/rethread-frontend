const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.8;

function replaceExtension(name: string, ext: string): string {
  const dot = name.lastIndexOf('.');
  return (dot === -1 ? name : name.slice(0, dot)) + ext;
}

export function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;

      if (width <= MAX_WIDTH && height <= MAX_HEIGHT && file.size <= 500_000) {
        URL.revokeObjectURL(img.src);
        resolve(file);
        return;
      }

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(img.src);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File(
            [blob],
            replaceExtension(file.name, '.jpg'),
            { type: 'image/jpeg', lastModified: file.lastModified },
          );
          resolve(compressed);
        },
        'image/jpeg',
        QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error(`Falha ao processar imagem: ${file.name}`));
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
