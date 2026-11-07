export interface DyeColor {
  id: string;
  name: string;
  labelId: string; // Indonesian name (e.g. "Merah", "Biru Langit")
  hex: string;
  rgb: [number, number, number];
  enabled: boolean;
  isCustom?: boolean;
}

export type RecolorMode = 'python_strict' | 'euclidean_tolerance' | 'shading_tint' | 'multiply';

export interface RecolorSettings {
  sourceColorHex: string;
  sourceRgb: [number, number, number];
  tolerance: number; // 0 to 255
  strength: number; // 0.0 to 1.0
  mode: RecolorMode;
  preserveAlpha: boolean;
}

export interface TextureFile {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface GeneratedVariant {
  id: string;
  name: string;
  labelId: string;
  hex: string;
  rgb: [number, number, number];
  dataUrl: string;
  width: number;
  height: number;
  blob?: Blob;
}

export interface SampleTexture {
  id: string;
  name: string;
  category: string;
  description: string;
  dataUrl: string;
  sourceColorHex: string;
  tolerance: number;
  mode: RecolorMode;
}
