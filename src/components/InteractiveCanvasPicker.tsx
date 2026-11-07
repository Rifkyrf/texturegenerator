import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Crosshair,
  Check,
  Sparkles,
  Pipette,
  Eye,
  Layers,
} from 'lucide-react';
import { ExtractedColor, RecolorSettings, TextureFile } from '../types';
import { getContrastTextColor, hexToRgb, rgbToHex } from '../utils/colorUtils';
import { extractTextureColors, generateMatchingMask } from '../utils/recolorEngine';

interface Props {
  sourceTexture: TextureFile;
  sourceImageData: ImageData | null;
  settings: RecolorSettings;
  onSelectColor: (hex: string, rgb: [number, number, number]) => void;
}

export const InteractiveCanvasPicker: React.FC<Props> = ({
  sourceTexture,
  sourceImageData,
  settings,
  onSelectColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Zoom level state (2x up to 48x)
  const [zoom, setZoom] = useState<number>(16);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [highlightMatches, setHighlightMatches] = useState<boolean>(false);
  const [hoverPixel, setHoverPixel] = useState<{
    x: number;
    y: number;
    hex: string;
    rgb: [number, number, number];
    alpha: number;
  } | null>(null);

  const [selectedPixelInfo, setSelectedPixelInfo] = useState<{
    x: number;
    y: number;
    hex: string;
    time: number;
  } | null>(null);

  const [hasEyeDropper, setHasEyeDropper] = useState<boolean>(false);

  useEffect(() => {
    setHasEyeDropper(typeof window !== 'undefined' && 'EyeDropper' in window);
  }, []);

  // Auto adjust default zoom based on texture resolution
  useEffect(() => {
    if (sourceTexture.width <= 16) {
      setZoom(16);
    } else if (sourceTexture.width <= 32) {
      setZoom(12);
    } else if (sourceTexture.width <= 64) {
      setZoom(6);
    } else {
      setZoom(4);
    }
  }, [sourceTexture.width, sourceTexture.height]);

  // Extract all unique colors from the texture for 1-tap mobile selection!
  const extractedColors: ExtractedColor[] = useMemo(() => {
    if (!sourceImageData) return [];
    return extractTextureColors(sourceImageData);
  }, [sourceImageData]);

  // Render texture to canvas with crisp pixels and optional grid / matching mask
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImageData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = sourceTexture.width;
    const h = sourceTexture.height;

    canvas.width = w * zoom;
    canvas.height = h * zoom;

    ctx.imageSmoothingEnabled = false;

    // Draw background texture or matching mask
    if (highlightMatches) {
      const maskData = generateMatchingMask(sourceImageData, settings);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(maskData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }
    } else {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(sourceImageData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }
    }

    // Draw Pixel Grid lines
    if (showGrid && zoom >= 6) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= w; x++) {
        ctx.beginPath();
        ctx.moveTo(x * zoom + 0.5, 0);
        ctx.lineTo(x * zoom + 0.5, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= h; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * zoom + 0.5);
        ctx.lineTo(canvas.width, y * zoom + 0.5);
        ctx.stroke();
      }
    }

    // Draw hover pixel highlight outline
    if (hoverPixel) {
      ctx.strokeStyle = '#38bdf8'; // Sky blue border
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoverPixel.x * zoom + 0.5,
        hoverPixel.y * zoom + 0.5,
        zoom - 1,
        zoom - 1
      );
    }

    // Draw selected pixel mark
    if (selectedPixelInfo) {
      ctx.strokeStyle = '#10b981'; // Emerald green
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectedPixelInfo.x * zoom + 0.5,
        selectedPixelInfo.y * zoom + 0.5,
        zoom - 1,
        zoom - 1
      );
    }
  }, [sourceTexture, sourceImageData, zoom, showGrid, highlightMatches, settings, hoverPixel, selectedPixelInfo]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Helper to extract pixel info from client coordinates
  const getPixelAtCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImageData) return null;

    const rect = canvas.getBoundingClientRect();
    const xRel = clientX - rect.left;
    const yRel = clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const internalX = xRel * scaleX;
    const internalY = yRel * scaleY;

    const px = Math.floor(internalX / zoom);
    const py = Math.floor(internalY / zoom);

    if (px >= 0 && px < sourceTexture.width && py >= 0 && py < sourceTexture.height) {
      const idx = (py * sourceTexture.width + px) * 4;
      const data = sourceImageData.data;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const hex = rgbToHex(r, g, b);
      return {
        x: px,
        y: py,
        hex,
        rgb: [r, g, b] as [number, number, number],
        alpha: Math.round((a / 255) * 100),
      };
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pixel = getPixelAtCoords(e.clientX, e.clientY);
    setHoverPixel(pixel);
  };

  const handleMouseLeave = () => {
    setHoverPixel(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pixel = getPixelAtCoords(e.clientX, e.clientY);
    if (pixel && pixel.alpha > 0) {
      onSelectColor(pixel.hex, pixel.rgb);
      setSelectedPixelInfo({
        x: pixel.x,
        y: pixel.y,
        hex: pixel.hex,
        time: Date.now(),
      });
    }
  };

  // Touch Support for Mobile / Smartphone
  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const pixel = getPixelAtCoords(touch.clientX, touch.clientY);
    if (pixel && pixel.alpha > 0) {
      setHoverPixel(pixel);
      onSelectColor(pixel.hex, pixel.rgb);
      setSelectedPixelInfo({
        x: pixel.x,
        y: pixel.y,
        hex: pixel.hex,
        time: Date.now(),
      });
    }
  };

  // Native EyeDropper API fallback
  const handleNativeEyeDropper = async () => {
    try {
      // @ts-expect-error EyeDropper is experimental browser API
      if (window.EyeDropper) {
        // @ts-expect-error EyeDropper is experimental browser API
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          const rgb = hexToRgb(hex);
          onSelectColor(hex, rgb);
        }
      }
    } catch {
      // User cancelled picker
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm transition-colors">
      {/* Header with Title and Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <Pipette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Pilih Warna yang Mau Diganti
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50">
                Tap Piksel atau Palet di Bawah
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Perbesar gambar lalu tap piksel, atau pilih langsung dari daftar warna terdeteksi
            </p>
          </div>
        </div>

        {/* Zoom & Canvas Toolbar (Prominent, Touch-friendly) */}
        <div className="flex items-center gap-1.5 flex-wrap bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl self-start sm:self-auto">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(2, z - (z > 16 ? 4 : 2)))}
            title="Perkecil Zoom (Zoom Out)"
            className="p-2 sm:p-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center font-bold"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom level badge */}
          <span className="text-xs font-mono font-bold px-1.5 text-zinc-800 dark:text-zinc-200 min-w-10 text-center">
            {zoom}x
          </span>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(48, z + (z >= 16 ? 4 : 2)))}
            title="Perbesar Zoom (Zoom In)"
            className="p-2 sm:p-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center font-bold"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Quick Zoom Presets */}
          <div className="hidden xs:flex items-center gap-1 ml-1 pl-1 border-l border-zinc-300 dark:border-zinc-800">
            {[8, 16, 24, 32].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setZoom(lvl)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  zoom === lvl
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {lvl}x
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-800 mx-1" />

          {/* Toggle Grid */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="Tampilkan / Sembunyikan Grid Piksel"
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              showGrid
                ? 'bg-zinc-200 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-medium'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          {/* Highlight Matching Mask */}
          <button
            type="button"
            onClick={() => setHighlightMatches(!highlightMatches)}
            title="Sorot piksel yang cocok dengan warna & toleransi aktif"
            className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              highlightMatches
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-medium'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sorot Mask</span>
          </button>

          {hasEyeDropper && (
            <button
              type="button"
              onClick={handleNativeEyeDropper}
              title="Eyedropper Sistem"
              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Canvas Display Viewport (Scrollable with finger or mouse) */}
        <div
          ref={containerRef}
          className="lg:col-span-8 flex flex-col items-center justify-center p-3 sm:p-5 bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-auto min-h-60 max-h-[460px] relative transition-colors"
        >
          {/* Transparency checkerboard background */}
          <div className="bg-checkerboard p-2 rounded-xl shadow-inner inline-block max-w-full overflow-auto">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleCanvasClick}
              onTouchStart={handleTouch}
              onTouchMove={handleTouch}
              className="pixelated cursor-crosshair border border-zinc-700/60 shadow-xl transition-all block touch-none"
              style={{
                width: sourceTexture.width * zoom,
                height: sourceTexture.height * zoom,
                maxWidth: 'none',
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 text-center">
            <span>Resolusi Asli: {sourceTexture.width} × {sourceTexture.height} px</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <Crosshair className="w-3 h-3" /> Tap atau klik piksel untuk memilih warna
            </span>
          </div>
        </div>

        {/* Real-time Magnifier / Color Inspector & Active Selection */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col gap-3">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Status Piksel yang Disentuh</span>
              {hoverPixel ? (
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/40">
                  X:{hoverPixel.x} Y:{hoverPixel.y}
                </span>
              ) : (
                <span className="text-[11px] text-zinc-400">Sentuh piksel</span>
              )}
            </div>

            {/* Current Hovered Color Preview Box */}
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-inner shrink-0 relative overflow-hidden bg-checkerboard">
                {hoverPixel && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: hoverPixel.alpha === 0 ? 'transparent' : hoverPixel.hex,
                      opacity: hoverPixel.alpha / 100,
                    }}
                  />
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                {hoverPixel ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {hoverPixel.hex}
                      </span>
                      {hoverPixel.alpha < 100 && (
                        <span className="text-[10px] text-amber-500 font-mono">
                          (Alpha {hoverPixel.alpha}%)
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      rgb({hoverPixel.rgb[0]}, {hoverPixel.rgb[1]}, {hoverPixel.rgb[2]})
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectColor(hoverPixel.hex, hoverPixel.rgb)}
                      className="mt-1 text-left text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Pilih warna ini
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-zinc-400 italic">
                    Tap atau arahkan jari/mouse ke piksel pada kanvas
                  </div>
                )}
              </div>
            </div>

            {/* Currently Active Source Color Summary */}
            <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-2.5 flex flex-col gap-1.5">
              <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span>Warna Sumber yang Akan Diganti:</span>
                <span className="text-[11px] text-zinc-500">Toleransi: {settings.tolerance}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg border border-zinc-300 dark:border-zinc-700 shrink-0 shadow-sm"
                  style={{ backgroundColor: settings.sourceColorHex }}
                />
                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {settings.sourceColorHex}
                </span>
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  rgb({settings.sourceRgb[0]}, {settings.sourceRgb[1]}, {settings.sourceRgb[2]})
                </span>
              </div>
            </div>

            {selectedPixelInfo && Date.now() - selectedPixelInfo.time < 5000 && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50 rounded-lg p-2 flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Warna <strong>{selectedPixelInfo.hex}</strong> dipilih dari koordinat ({selectedPixelInfo.x}, {selectedPixelInfo.y})!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1-TAP PALETTE SELECTOR FOR MOBILE: Colors Extracted from Texture */}
      {extractedColors.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              Pilih Langsung dari Palet Warna Tekstur ({extractedColors.length} Warna Terdeteksi):
            </span>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Tap untuk langsung mengganti
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
            {extractedColors.map((color) => {
              const isSelected =
                settings.sourceColorHex.toUpperCase() === color.hex.toUpperCase();
              const textColor = getContrastTextColor(color.hex);

              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => onSelectColor(color.hex, color.rgb)}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
                  }`}
                  title={`${color.hex} (${color.count} piksel, ~${color.percentage}%)`}
                >
                  <div
                    className="w-5 h-5 rounded-md border border-black/20 shrink-0 flex items-center justify-center font-bold text-[10px]"
                    style={{ backgroundColor: color.hex, color: textColor }}
                  >
                    {isSelected && '✓'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {color.hex}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {color.percentage}% ({color.count}px)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
