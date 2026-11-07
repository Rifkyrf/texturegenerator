import { DyeColor, GeneratedVariant, RecolorSettings, TextureFile } from '../types';
import { getPerceivedLuminance } from './colorUtils';

/**
 * Check if a pixel matches the source color within tolerance
 */
export function isPixelMatching(
  r: number,
  g: number,
  b: number,
  a: number,
  settings: RecolorSettings
): boolean {
  if (a === 0) return false;
  const [sr, sg, sb] = settings.sourceRgb;
  const tol = settings.tolerance;

  switch (settings.mode) {
    case 'python_strict': {
      // Direct generalization of the user's Python script:
      // if (255 - r) > white_tolerance or (255 - g) > white_tolerance or (255 - b) > white_tolerance
      return (
        Math.abs(sr - r) <= tol &&
        Math.abs(sg - g) <= tol &&
        Math.abs(sb - b) <= tol
      );
    }
    case 'euclidean_tolerance': {
      const dist = Math.sqrt((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2);
      return dist <= tol * 1.5;
    }
    case 'shading_tint':
    case 'multiply': {
      // For shading tint, we also match pixels close to the source tone
      const dist = Math.sqrt((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2);
      return dist <= Math.max(tol * 1.8, 15);
    }
    default:
      return Math.abs(sr - r) <= tol && Math.abs(sg - g) <= tol && Math.abs(sb - b) <= tol;
  }
}

/**
 * Recolor ImageData in-place or into target ImageData buffer
 */
export function processRecolorImageData(
  sourceData: ImageData,
  targetRgb: [number, number, number],
  settings: RecolorSettings
): ImageData {
  const width = sourceData.width;
  const height = sourceData.height;
  const output = new ImageData(
    new Uint8ClampedArray(sourceData.data),
    width,
    height
  );

  const [tr, tg, tb] = targetRgb;
  const [sr, sg, sb] = settings.sourceRgb;
  const sourceLum = Math.max(1, getPerceivedLuminance(sr, sg, sb));
  const strength = Math.max(0, Math.min(1, settings.strength));
  const data = output.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    if (!isPixelMatching(r, g, b, a, settings)) {
      continue;
    }

    let nr = tr;
    let ng = tg;
    let nb = tb;

    if (settings.mode === 'shading_tint') {
      // Retain the brightness variance of the original pixel relative to the source color
      // E.g., highlights remain brighter, shadows remain darker
      const pixelLum = getPerceivedLuminance(r, g, b);
      const ratio = pixelLum / sourceLum;
      nr = Math.round(tr * ratio);
      ng = Math.round(tg * ratio);
      nb = Math.round(tb * ratio);
    } else if (settings.mode === 'multiply') {
      nr = Math.round((r * tr) / 255);
      ng = Math.round((g * tg) / 255);
      nb = Math.round((b * tb) / 255);
    }

    // Apply recolor strength (matching Python script formula)
    // nr = round(r + (nr - r) * strength)
    if (strength < 1.0) {
      nr = Math.round(r + (nr - r) * strength);
      ng = Math.round(g + (ng - g) * strength);
      nb = Math.round(b + (nb - b) * strength);
    }

    data[i] = Math.max(0, Math.min(255, nr));
    data[i + 1] = Math.max(0, Math.min(255, ng));
    data[i + 2] = Math.max(0, Math.min(255, nb));
    // preserve alpha
    if (!settings.preserveAlpha) {
      data[i + 3] = a;
    }
  }

  return output;
}

/**
 * Creates an image mask displaying which pixels currently match the source color
 */
export function generateMatchingMask(
  sourceData: ImageData,
  settings: RecolorSettings
): ImageData {
  const width = sourceData.width;
  const height = sourceData.height;
  const mask = new ImageData(new Uint8ClampedArray(sourceData.data.length), width, height);
  const src = sourceData.data;
  const dst = mask.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];
    const a = src[i + 3];

    if (a > 0 && isPixelMatching(r, g, b, a, settings)) {
      // Highlight matching pixels with an emerald/cyan glowing overlay
      dst[i] = 16;     // R
      dst[i + 1] = 185; // G
      dst[i + 2] = 129; // B
      dst[i + 3] = 210; // A
    } else if (a > 0) {
      // Dim non-matching pixels slightly
      dst[i] = Math.round(r * 0.4);
      dst[i + 1] = Math.round(g * 0.4);
      dst[i + 2] = Math.round(b * 0.4);
      dst[i + 3] = Math.round(a * 0.6);
    }
  }
  return mask;
}

/**
 * Convert HTMLImageElement to ImageData
 */
export function getImageDataFromElement(img: HTMLImageElement): ImageData | null {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Convert ImageData to DataURL
 */
export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Convert ImageData to Blob
 */
export function imageDataToBlob(imageData: ImageData): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/**
 * Process all enabled color variants
 */
export async function generateAllVariants(
  sourceImage: TextureFile,
  sourceImageData: ImageData,
  colors: DyeColor[],
  settings: RecolorSettings
): Promise<GeneratedVariant[]> {
  const enabledColors = colors.filter((c) => c.enabled);
  const variants: GeneratedVariant[] = [];

  for (const color of enabledColors) {
    const recoloredImageData = processRecolorImageData(
      sourceImageData,
      color.rgb,
      settings
    );
    const dataUrl = imageDataToDataUrl(recoloredImageData);
    const blob = await imageDataToBlob(recoloredImageData);

    variants.push({
      id: color.id,
      name: color.name,
      labelId: color.labelId,
      hex: color.hex,
      rgb: color.rgb,
      dataUrl,
      width: sourceImage.width,
      height: sourceImage.height,
      blob: blob || undefined,
    });
  }

  return variants;
}
