export const processImage = async (
  imageDataUrl: string,
  targetSize: number = 1024
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Set canvas size to target dimensions
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Calculate dimensions for cropping
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      // Draw image centered and cropped
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(
        img,
        x, y, size, size,
        0, 0, targetSize, targetSize
      );

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image to blob'));
        }
      }, 'image/png');
    };
    img.src = imageDataUrl;
  });
};