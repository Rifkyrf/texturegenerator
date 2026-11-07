import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eye, ZoomIn, ZoomOut, Grid3X3, Crosshair, Check, Sparkles, Pipette } from 'lucide-react';
import { RecolorSettings, TextureFile } from '../types';
import { hexToRgb, rgbToHex } from '../utils/colorUtils';
import { generateMatchingMask } from '../utils/recolorEngine';

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

  const [zoom, setZoom] = useState<number>(12); // Default 12x zoom for 16x16 / 32x32 textures
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
      setZoom(3);
    }
  }, [sourceTexture.width, sourceTexture.height]);

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
      // Create temp canvas to draw maskData scaled up
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
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

  // Handle canvas mouse move to detect pixel
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImageData) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Calculate pixel coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const internalX = clientX * scaleX;
    const internalY = clientY * scaleY;

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
      setHoverPixel({
        x: px,
        y: py,
        hex,
        rgb: [r, g, b],
        alpha: Math.round((a / 255) * 100),
      });
    } else {
      setHoverPixel(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverPixel(null);
  };

  // Click pixel to set as source color
  const handleCanvasClick = () => {
    if (hoverPixel && hoverPixel.alpha > 0) {
      onSelectColor(hoverPixel.hex, hoverPixel.rgb);
      setSelectedPixelInfo({
        x: hoverPixel.x,
        y: hoverPixel.y,
        hex: hoverPixel.hex,
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
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      {/* Header with Title and Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Pipette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
              Eyedropper & Pixel Inspector
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                Klik Piksel Tekstur
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Klik langsung pada gambar tekstur di bawah untuk memilih warna yang ingin diganti.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(2, z - 2))}
            title="Perkecil Zoom"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-medium px-1 text-zinc-300 min-w-8 text-center">
            {zoom}x
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(32, z + 2))}
            title="Perbesar Zoom"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-zinc-800 mx-1" />

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid Pixel"
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              showGrid
                ? 'bg-zinc-800 text-emerald-400 font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setHighlightMatches(!highlightMatches)}
            title="Sorot piksel yang cocok dengan toleransi"
            className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              highlightMatches
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sorot Mask</span>
          </button>

          {hasEyeDropper && (
            <button
              type="button"
              onClick={handleNativeEyeDropper}
              title="Gunakan Eyedropper Layar Sistem"
              className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Canvas Display Viewport */}
        <div
          ref={containerRef}
          className="lg:col-span-8 flex flex-col items-center justify-center p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl overflow-auto min-h-64 max-h-[440px] relative"
        >
          {/* Transparency checkerboard background */}
          <div className="bg-checkerboard p-2 rounded-lg shadow-inner inline-block">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleCanvasClick}
              className="pixelated cursor-crosshair border border-zinc-700/60 shadow-xl transition-all block"
              style={{
                width: sourceTexture.width * zoom,
                height: sourceTexture.height * zoom,
                maxWidth: '100%',
                maxHeight: '380px',
                objectFit: 'contain',
              }}
            />
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
            <span>Ukuran Asli: {sourceTexture.width} × {sourceTexture.height} px</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-emerald-400" /> Arahkan & klik untuk memilih
            </span>
          </div>
        </div>

        {/* Real-time Magnifier / Color Inspector Loupe */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex flex-col gap-3">
            <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Status Piksel Kursor</span>
              {hoverPixel ? (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  X:{hoverPixel.x} Y:{hoverPixel.y}
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500">Arahkan ke tekstur</span>
              )}
            </div>

            {/* Current Hovered Color Preview Box */}
            <div className="flex items-center gap-3 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <div
                className="w-12 h-12 rounded-lg border border-zinc-700/80 shadow-inner shrink-0 relative overflow-hidden bg-checkerboard"
              >
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
                      <span className="font-mono text-sm font-bold text-zinc-100">
                        {hoverPixel.hex}
                      </span>
                      {hoverPixel.alpha < 100 && (
                        <span className="text-[10px] text-amber-400 font-mono">
                          (Transparan {hoverPixel.alpha}%)
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-zinc-400">
                      rgb({hoverPixel.rgb[0]}, {hoverPixel.rgb[1]}, {hoverPixel.rgb[2]})
                    </span>
                    <button
                      type="button"
                      onClick={handleCanvasClick}
                      className="mt-1 text-left text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Klik untuk jadikan warna sumber
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-zinc-500 italic">
                    Arahkan mouse ke piksel manapun pada gambar tekstur di sebelah kiri
                  </div>
                )}
              </div>
            </div>

            {/* Currently Active Source Color Summary */}
            <div className="border-t border-zinc-800/80 pt-2.5 flex flex-col gap-1.5">
              <div className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                <span>Warna Sumber Aktif:</span>
                <span className="text-[11px] text-zinc-500">Toleransi: {settings.tolerance}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-md border border-zinc-700 shrink-0 shadow-sm"
                  style={{ backgroundColor: settings.sourceColorHex }}
                />
                <span className="font-mono text-xs font-semibold text-zinc-200">
                  {settings.sourceColorHex}
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  rgb({settings.sourceRgb[0]}, {settings.sourceRgb[1]}, {settings.sourceRgb[2]})
                </span>
              </div>
            </div>

            {selectedPixelInfo && Date.now() - selectedPixelInfo.time < 5000 && (
              <div className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg p-2 flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Warna <strong>{selectedPixelInfo.hex}</strong> dipilih dari piksel ({selectedPixelInfo.x}, {selectedPixelInfo.y})!
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-zinc-400 bg-zinc-950/50 border border-zinc-800/60 rounded-xl p-3 leading-relaxed">
            <strong className="text-zinc-200">Tips Minecraft Modding:</strong>
            <p className="mt-1 text-zinc-400">
              Jika tekstur Anda memiliki bayangan (seperti wol atau baju zirah kulit), gunakan mode 
              <span className="text-emerald-400 font-medium"> Shading & Tint</span> di panel pengaturan agar detail lekukan dan bayangan tetap natural!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
