import { DyeColor } from '../types';

/**
 * Standard 16 Minecraft Dye Colors
 * Exact values matching user's Python script + standard Minecraft Java Edition dyes
 */
export const DEFAULT_MINECRAFT_DYES: DyeColor[] = [
  { id: 'black', name: 'black', labelId: 'Hitam (Black)', hex: '#1D1D21', rgb: [29, 29, 33], enabled: true },
  { id: 'red', name: 'red', labelId: 'Merah (Red)', hex: '#B02E26', rgb: [176, 46, 38], enabled: true },
  { id: 'green', name: 'green', labelId: 'Hijau (Green)', hex: '#5E7C16', rgb: [94, 124, 22], enabled: true },
  { id: 'brown', name: 'brown', labelId: 'Cokelat (Brown)', hex: '#835432', rgb: [131, 84, 50], enabled: true },
  { id: 'blue', name: 'blue', labelId: 'Biru (Blue)', hex: '#3C44AA', rgb: [60, 68, 170], enabled: true },
  { id: 'purple', name: 'purple', labelId: 'Ungu (Purple)', hex: '#8932B8', rgb: [137, 50, 184], enabled: true },
  { id: 'cyan', name: 'cyan', labelId: 'Sian (Cyan)', hex: '#169C9C', rgb: [22, 156, 156], enabled: true },
  { id: 'lightgray', name: 'lightgray', labelId: 'Abu-Abu Muda (Light Gray)', hex: '#9D9D97', rgb: [157, 157, 151], enabled: true },
  { id: 'gray', name: 'gray', labelId: 'Abu-Abu (Gray)', hex: '#474F52', rgb: [71, 79, 82], enabled: true },
  { id: 'pink', name: 'pink', labelId: 'Merah Muda (Pink)', hex: '#F38BAA', rgb: [243, 139, 170], enabled: true },
  { id: 'lime', name: 'lime', labelId: 'Jeruk Nipis (Lime)', hex: '#80C71F', rgb: [128, 199, 31], enabled: true },
  { id: 'yellow', name: 'yellow', labelId: 'Kuning (Yellow)', hex: '#FED83D', rgb: [254, 216, 61], enabled: true },
  { id: 'light_blue', name: 'light_blue', labelId: 'Biru Muda (Light Blue)', hex: '#3AB3DA', rgb: [58, 179, 218], enabled: true },
  { id: 'magenta', name: 'magenta', labelId: 'Magenta', hex: '#C74EBD', rgb: [199, 78, 189], enabled: true },
  { id: 'orange', name: 'orange', labelId: 'Oranye (Orange)', hex: '#F9801D', rgb: [249, 128, 29], enabled: true },
  { id: 'white', name: 'white', labelId: 'Putih (White)', hex: '#F9FFFE', rgb: [249, 255, 254], enabled: true },
];

export const PRESET_PALETTES: { id: string; name: string; description: string; colors: DyeColor[] }[] = [
  {
    id: 'dyes_16',
    name: '16 Warna Dye Minecraft (Lengkap)',
    description: 'Semua 16 warna pewarna resmi Minecraft standar Java Edition',
    colors: DEFAULT_MINECRAFT_DYES,
  },
  {
    id: 'dyes_15_python',
    name: '15 Warna Dye (Sesuai Skrip Python)',
    description: '15 warna dye tanpa warna putih (untuk tekstur sumber putih)',
    colors: DEFAULT_MINECRAFT_DYES.map(c => ({
      ...c,
      enabled: c.id !== 'white',
    })),
  },
  {
    id: 'pastel',
    name: 'Palet Pastel Lembut',
    description: 'Warna-warna lembut dan estetik untuk variasi tekstur modern',
    colors: [
      { id: 'pastel_peach', name: 'pastel_peach', labelId: 'Peach', hex: '#FFBE98', rgb: [255, 190, 152], enabled: true, isCustom: true },
      { id: 'pastel_mint', name: 'pastel_mint', labelId: 'Mint', hex: '#A8E6CF', rgb: [168, 230, 207], enabled: true, isCustom: true },
      { id: 'pastel_lavender', name: 'pastel_lavender', labelId: 'Lavender', hex: '#DED2F9', rgb: [222, 210, 249], enabled: true, isCustom: true },
      { id: 'pastel_lemon', name: 'pastel_lemon', labelId: 'Lemon', hex: '#FFF3B0', rgb: [255, 243, 176], enabled: true, isCustom: true },
      { id: 'pastel_sky', name: 'pastel_sky', labelId: 'Sky', hex: '#BEE1E6', rgb: [190, 225, 230], enabled: true, isCustom: true },
      { id: 'pastel_rose', name: 'pastel_rose', labelId: 'Rose', hex: '#FAD2E1', rgb: [250, 210, 225], enabled: true, isCustom: true },
      { id: 'pastel_sage', name: 'pastel_sage', labelId: 'Sage', hex: '#C5D8A4', rgb: [197, 216, 164], enabled: true, isCustom: true },
      { id: 'pastel_lilac', name: 'pastel_lilac', labelId: 'Lilac', hex: '#E2C2FF', rgb: [226, 194, 255], enabled: true, isCustom: true },
    ],
  },
  {
    id: 'minerals',
    name: 'Minecraft Ores & Minerals',
    description: 'Palet bijih mineral Minecraft (Diamond, Gold, Emerald, Netherite, Copper)',
    colors: [
      { id: 'copper', name: 'copper', labelId: 'Tembaga (Copper)', hex: '#C15A37', rgb: [193, 90, 55], enabled: true, isCustom: true },
      { id: 'iron', name: 'iron', labelId: 'Besi (Iron)', hex: '#D8D8D8', rgb: [216, 216, 216], enabled: true, isCustom: true },
      { id: 'gold', name: 'gold', labelId: 'Emas (Gold)', hex: '#FCEE4B', rgb: [252, 238, 75], enabled: true, isCustom: true },
      { id: 'diamond', name: 'diamond', labelId: 'Berlian (Diamond)', hex: '#4AEDD9', rgb: [74, 237, 217], enabled: true, isCustom: true },
      { id: 'emerald', name: 'emerald', labelId: 'Zamrud (Emerald)', hex: '#17DD62', rgb: [23, 221, 98], enabled: true, isCustom: true },
      { id: 'amethyst', name: 'amethyst', labelId: 'Kecubung (Amethyst)', hex: '#8753C4', rgb: [135, 83, 196], enabled: true, isCustom: true },
      { id: 'lapis', name: 'lapis', labelId: 'Lapis Lazuli', hex: '#1949A2', rgb: [25, 73, 162], enabled: true, isCustom: true },
      { id: 'netherite', name: 'netherite', labelId: 'Netherite', hex: '#4D4346', rgb: [77, 67, 70], enabled: true, isCustom: true },
      { id: 'redstone', name: 'redstone', labelId: 'Redstone', hex: '#FF2400', rgb: [255, 36, 0], enabled: true, isCustom: true },
    ],
  },
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Neon',
    description: 'Warna neon terang berintensitas tinggi untuk tema futuristik',
    colors: [
      { id: 'neon_pink', name: 'neon_pink', labelId: 'Neon Pink', hex: '#FF007F', rgb: [255, 0, 127], enabled: true, isCustom: true },
      { id: 'neon_cyan', name: 'neon_cyan', labelId: 'Neon Cyan', hex: '#00F0FF', rgb: [0, 240, 255], enabled: true, isCustom: true },
      { id: 'neon_green', name: 'neon_green', labelId: 'Neon Green', hex: '#39FF14', rgb: [57, 255, 20], enabled: true, isCustom: true },
      { id: 'neon_yellow', name: 'neon_yellow', labelId: 'Neon Yellow', hex: '#FFE600', rgb: [255, 230, 0], enabled: true, isCustom: true },
      { id: 'neon_purple', name: 'neon_purple', labelId: 'Neon Purple', hex: '#B026FF', rgb: [176, 38, 255], enabled: true, isCustom: true },
      { id: 'neon_orange', name: 'neon_orange', labelId: 'Neon Orange', hex: '#FF5F1F', rgb: [255, 95, 31], enabled: true, isCustom: true },
    ],
  },
];

export function hexToRgb(hexStr: string): [number, number, number] {
  let hex = hexStr.trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) {
    return [255, 255, 255];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [isNaN(r) ? 255 : r, isNaN(g) ? 255 : g, isNaN(b) ? 255 : b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getPerceivedLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function getContrastTextColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const lum = getPerceivedLuminance(r, g, b);
  return lum > 145 ? '#09090b' : '#ffffff';
}

export function formatRgbString(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/**
 * Export colors list as JSON object matching user's Python script colors.json
 * { "name": "#HEX" }
 */
export function exportColorsToJson(colors: DyeColor[]): string {
  const dict: Record<string, string> = {};
  for (const c of colors) {
    dict[c.name] = c.hex;
  }
  return JSON.stringify(dict, null, 2);
}

/**
 * Import user's colors.json (from Python script or exported from app)
 */
export function importColorsFromJson(jsonText: string): DyeColor[] {
  const parsed = JSON.parse(jsonText);
  const results: DyeColor[] = [];
  
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        const hex = value.startsWith('#') ? value : `#${value}`;
        const rgb = hexToRgb(hex);
        results.push({
          id: key.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          name: key,
          labelId: key.replace(/_/g, ' '),
          hex,
          rgb,
          enabled: true,
          isCustom: true,
        });
      }
    }
  } else if (Array.isArray(parsed)) {
    // Array format support
    for (const item of parsed) {
      if (item && item.name && item.hex) {
        results.push({
          id: item.id || item.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          name: item.name,
          labelId: item.labelId || item.name,
          hex: item.hex,
          rgb: item.rgb || hexToRgb(item.hex),
          enabled: item.enabled ?? true,
          isCustom: true,
        });
      }
    }
  }
  
  if (results.length === 0) {
    throw new Error('Format JSON tidak valid. Gunakan format: { "nama_warna": "#HEX" }');
  }
  
  return results;
}
