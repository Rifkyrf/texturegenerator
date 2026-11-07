import { SampleTexture } from '../types';

/**
 * Helper to generate 16x16 pixel art textures directly into DataURLs
 */
function createPixelTexture(
  pixels: (string | null)[][],
  palette: Record<string, [number, number, number, number]>
): string {
  const canvas = document.createElement('canvas');
  const h = pixels.length;
  const w = pixels[0].length;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const char = pixels[y][x];
      const idx = (y * w + x) * 4;
      if (char && palette[char]) {
        const [r, g, b, a] = palette[char];
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = a;
      } else {
        data[idx + 3] = 0; // transparent
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Wool Texture (16x16)
 * A: #FFFFFF (White highlight)
 * B: #EDEDED (White midtone)
 * C: #DFDFDF (White shadow 1)
 * D: #CECECE (White shadow 2)
 */
function generateWool(): string {
  const pal: Record<string, [number, number, number, number]> = {
    A: [255, 255, 255, 255],
    B: [237, 237, 237, 255],
    C: [223, 223, 223, 255],
    D: [206, 206, 206, 255],
  };

  const grid = [
    ['B','A','B','C','B','A','A','B','C','B','A','B','C','D','C','B'],
    ['A','A','C','D','C','B','A','C','D','A','A','C','D','C','B','A'],
    ['B','C','D','D','B','A','B','D','C','B','B','D','D','B','A','B'],
    ['C','D','C','B','A','B','C','C','B','A','C','C','B','A','B','C'],
    ['B','C','B','A','A','C','D','B','A','A','D','B','A','A','C','D'],
    ['A','B','A','B','C','D','C','B','B','C','D','C','B','B','C','D'],
    ['A','A','C','D','D','C','A','A','C','D','D','C','A','A','C','D'],
    ['B','C','D','C','B','B','B','C','D','C','B','B','B','C','D','C'],
    ['C','D','C','A','A','C','D','C','C','A','A','C','D','C','C','A'],
    ['B','C','B','A','B','D','D','B','B','A','B','D','D','B','B','A'],
    ['A','A','C','C','A','C','C','A','A','C','C','A','C','C','A','A'],
    ['B','B','D','D','B','A','A','B','B','D','D','B','A','A','B','B'],
    ['C','C','C','B','A','B','C','C','C','C','B','A','B','C','C','C'],
    ['D','D','B','A','A','C','D','D','D','D','B','A','A','C','D','D'],
    ['C','B','A','B','C','D','C','C','C','B','A','B','C','D','C','C'],
    ['B','A','B','C','D','C','B','B','B','A','B','C','D','C','B','B'],
  ];

  return createPixelTexture(grid, pal);
}

/**
 * Candle Item (16x16)
 * White candle body with wick & warm flame
 */
function generateCandle(): string {
  const pal: Record<string, [number, number, number, number]> = {
    // Candle body (Dyeable)
    A: [255, 255, 255, 255], // White highlight
    B: [238, 238, 238, 255], // White midtone
    C: [215, 215, 215, 255], // White shadow
    D: [190, 190, 190, 255], // White edge
    // Flame & Wick (Non-white, so they won't be replaced if tolerance is low)
    F: [255, 215, 0, 255],   // Yellow flame
    O: [255, 107, 0, 255],   // Orange flame
    R: [220, 38, 38, 255],   // Red flame base
    W: [60, 50, 40, 255],    // Dark wick
    P: [255, 255, 200, 255], // Flame hot core
  };

  const _ = null;
  const A = 'A';
  const B = 'B';
  const C = 'C';
  const D = 'D';
  const F = 'F';
  const O = 'O';
  const R = 'R';
  const W = 'W';
  const P = 'P';
  const grid = [
    [_,_,_,_,_,_,_,F,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,F,P,F,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,O,P,O,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,R,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,W,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,D,C,D,_,_,_,_,_,_,_],
    [_,_,_,_,_,D,A,B,C,D,_,_,_,_,_,_],
    [_,_,_,_,_,D,A,A,B,D,_,_,_,_,_,_],
    [_,_,_,_,_,D,A,B,B,D,_,_,_,_,_,_],
    [_,_,_,_,_,D,B,B,C,D,_,_,_,_,_,_],
    [_,_,_,_,_,D,A,B,C,D,_,_,_,_,_,_],
    [_,_,_,_,_,D,A,B,C,D,_,_,_,_,_,_],
    [_,_,_,_,_,D,B,C,C,D,_,_,_,_,_,_],
    [_,_,_,_,_,D,B,C,C,D,_,_,_,_,_,_],
    [_,_,_,_,_,_,D,D,D,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];

  return createPixelTexture(grid, pal);
}

/**
 * Leather Tunic / Chestplate (16x16)
 * Classic Minecraft leather armor with dyeable fabric and brown trim
 */
function generateLeatherArmor(): string {
  const pal: Record<string, [number, number, number, number]> = {
    // Dyeable tunic cloth
    A: [255, 255, 255, 255],
    B: [235, 235, 235, 255],
    C: [210, 210, 210, 255],
    D: [180, 180, 180, 255],
    // Undyed leather trim & collar (stays brown)
    T: [140, 90, 55, 255],
    U: [105, 65, 38, 255],
    V: [75, 45, 25, 255],
  };

  const _ = null;
  const A = 'A';
  const B = 'B';
  const C = 'C';
  const D = 'D';
  const T = 'T';
  const U = 'U';
  const V = 'V';
  const grid = [
    [_,_,_,_,T,T,_,_,_,_,T,T,_,_,_,_],
    [_,_,T,T,A,A,T,_,_,T,A,A,T,T,_,_],
    [_,T,A,A,A,A,A,T,T,A,A,A,A,A,T,_],
    [T,A,A,B,B,A,A,A,A,A,A,B,B,A,A,T],
    [T,B,B,C,C,B,B,B,B,B,B,C,C,B,B,T],
    [T,C,C,D,D,C,C,C,C,C,C,D,D,C,C,T],
    [_,V,V,V,B,B,A,A,A,A,B,B,V,V,V,_],
    [_,_,_,_,B,A,A,A,A,A,A,B,_,_,_,_],
    [_,_,_,_,B,A,B,B,B,B,A,B,_,_,_,_],
    [_,_,_,_,C,B,B,B,B,B,B,C,_,_,_,_],
    [_,_,_,_,C,B,C,C,C,C,B,C,_,_,_,_],
    [_,_,_,_,D,C,C,C,C,C,C,D,_,_,_,_],
    [_,_,_,_,U,U,U,U,U,U,U,U,_,_,_,_],
    [_,_,_,_,V,V,V,V,V,V,V,V,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];

  return createPixelTexture(grid, pal);
}

/**
 * Shulker Box Top (16x16)
 */
function generateShulkerBox(): string {
  const pal: Record<string, [number, number, number, number]> = {
    A: [255, 255, 255, 255],
    B: [235, 235, 235, 255],
    C: [215, 215, 215, 255],
    D: [195, 195, 195, 255],
    E: [165, 165, 165, 255],
  };

  const grid = [
    ['E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E'],
    ['E','D','D','D','D','D','D','D','D','D','D','D','D','D','D','E'],
    ['E','D','C','C','C','C','C','C','C','C','C','C','C','C','D','E'],
    ['E','D','C','B','B','B','B','B','B','B','B','B','B','C','D','E'],
    ['E','D','C','B','A','A','A','A','A','A','A','A','B','C','D','E'],
    ['E','D','C','B','A','B','B','B','B','B','B','A','B','C','D','E'],
    ['E','D','C','B','A','B','C','C','C','C','B','A','B','C','D','E'],
    ['E','D','C','B','A','B','C','D','D','C','B','A','B','C','D','E'],
    ['E','D','C','B','A','B','C','D','D','C','B','A','B','C','D','E'],
    ['E','D','C','B','A','B','C','C','C','C','B','A','B','C','D','E'],
    ['E','D','C','B','A','B','B','B','B','B','B','A','B','C','D','E'],
    ['E','D','C','B','A','A','A','A','A','A','A','A','B','C','D','E'],
    ['E','D','C','B','B','B','B','B','B','B','B','B','B','C','D','E'],
    ['E','D','C','C','C','C','C','C','C','C','C','C','C','C','D','E'],
    ['E','D','D','D','D','D','D','D','D','D','D','D','D','D','D','E'],
    ['E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E'],
  ];

  return createPixelTexture(grid, pal);
}

/**
 * Potion / Dye Flask (16x16)
 */
function generatePotionFlask(): string {
  const pal: Record<string, [number, number, number, number]> = {
    // Cork & Glass
    K: [160, 110, 70, 255],  // Cork
    G: [180, 200, 220, 200], // Glass edge
    H: [230, 245, 255, 240], // Glass reflection shine
    // Liquid (White dyeable liquid)
    A: [255, 255, 255, 255],
    B: [235, 235, 235, 255],
    C: [210, 210, 210, 255],
    D: [185, 185, 185, 255],
  };

  const _ = null;
  const K = 'K';
  const G = 'G';
  const H = 'H';
  const A = 'A';
  const B = 'B';
  const C = 'C';
  const D = 'D';
  const grid = [
    [_,_,_,_,_,_,K,K,K,K,_,_,_,_,_,_],
    [_,_,_,_,_,_,K,K,K,K,_,_,_,_,_,_],
    [_,_,_,_,_,_,G,G,G,G,_,_,_,_,_,_],
    [_,_,_,_,_,_,G,H,H,G,_,_,_,_,_,_],
    [_,_,_,_,_,G,G,H,H,G,G,_,_,_,_,_],
    [_,_,_,_,G,G,_,_,_,_,G,G,_,_,_,_],
    [_,_,_,G,G,_,_,_,_,_,_,G,G,_,_,_],
    [_,_,G,G,H,A,A,A,A,A,A,G,G,G,_,_],
    [_,G,G,H,A,B,B,B,B,B,B,C,G,G,G,_],
    [_,G,H,H,B,B,B,B,B,B,C,C,D,G,G,_],
    [_,G,H,A,B,B,B,B,B,C,C,D,D,G,G,_],
    [_,G,G,A,B,B,B,B,C,C,D,D,D,G,G,_],
    [_,G,G,B,B,C,C,C,C,D,D,D,D,G,G,_],
    [_,_,G,G,D,D,D,D,D,D,D,D,G,G,_,_],
    [_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];

  return createPixelTexture(grid, pal);
}

/**
 * Built-in Sample Textures List
 */
export const SAMPLE_TEXTURES: SampleTexture[] = [
  {
    id: 'wool',
    name: 'Blok Wol Putih (Wool)',
    category: 'Blocks',
    description: 'Tekstur standar blok wol Minecraft (16x16) dengan detail keriting dan bayangan.',
    dataUrl: generateWool(),
    sourceColorHex: '#FFFFFF',
    tolerance: 50,
    mode: 'shading_tint',
  },
  {
    id: 'candle',
    name: 'Lilin (Candle)',
    category: 'Items',
    description: 'Lilin Minecraft dengan sumbu dan api. Bagian lilin putih akan direcolor.',
    dataUrl: generateCandle(),
    sourceColorHex: '#FFFFFF',
    tolerance: 45,
    mode: 'shading_tint',
  },
  {
    id: 'leather_armor',
    name: 'Baju Kulit (Leather Armor)',
    category: 'Armor',
    description: 'Baju zirah kulit dyeable dengan pinggiran kulit cokelat asli.',
    dataUrl: generateLeatherArmor(),
    sourceColorHex: '#FFFFFF',
    tolerance: 55,
    mode: 'shading_tint',
  },
  {
    id: 'shulker_box',
    name: 'Kotak Shulker (Shulker Box)',
    category: 'Containers',
    description: 'Tekstur cangkang atas Shulker Box dengan efek gradien kotak.',
    dataUrl: generateShulkerBox(),
    sourceColorHex: '#FFFFFF',
    tolerance: 60,
    mode: 'shading_tint',
  },
  {
    id: 'potion_bottle',
    name: 'Botol Pewarna (Dye Flask)',
    category: 'Items',
    description: 'Botol ramuan/pewarna dengan kaca transparan dan cairan putih.',
    dataUrl: generatePotionFlask(),
    sourceColorHex: '#FFFFFF',
    tolerance: 50,
    mode: 'shading_tint',
  },
];
