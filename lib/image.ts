export async function compressImage(
  file: File,
  options?: { maxSize?: number; quality?: number }
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  const maxSize = options?.maxSize ?? 900;
  const quality = options?.quality ?? 0.72;

  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Görsel işlenemedi.");
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Görsel yüklenemedi."));
    image.src = src;
  });
}
