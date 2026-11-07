import React, { useState } from 'react';
import { X, ArrowLeftRight, Download } from 'lucide-react';
import { GeneratedVariant, TextureFile } from '../types';

interface Props {
  sourceTexture: TextureFile | null;
  variant: GeneratedVariant | null;
  onClose: () => void;
}

export const CompareModal: React.FC<Props> = ({
  sourceTexture,
  variant,
  onClose,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%

  if (!variant || !sourceTexture) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/15 border border-sky-500/30 rounded-xl text-sky-400">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100 capitalize">
                Perbandingan: Asli vs {variant.name}
              </h3>
              <p className="text-xs text-zinc-400">
                Geser slider untuk membandingkan sebelum dan sesudah recolor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Comparison Viewer */}
        <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl h-72 flex items-center justify-center overflow-hidden bg-checkerboard select-none">
          {/* Base / Original Image (Left side) */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={sourceTexture.dataUrl}
              alt="Asli"
              className="pixelated max-h-56 max-w-56 drop-shadow-xl"
            />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/75 text-zinc-200 text-xs font-semibold backdrop-blur-sm">
              Tekstur Asli
            </div>
          </div>

          {/* Recolored Variant (Right side) */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          >
            <img
              src={variant.dataUrl}
              alt={variant.name}
              className="pixelated max-h-56 max-w-56 drop-shadow-xl"
            />
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-semibold backdrop-blur-sm capitalize">
              {variant.name} ({variant.hex})
            </div>
          </div>

          {/* Vertical Divider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none z-10"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-zinc-900 shadow-lg flex items-center justify-center text-[10px]">
              ↔
            </div>
          </div>
        </div>

        {/* Slider control */}
        <div className="flex flex-col gap-1.5 px-1">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Tekstur Asli (Kiri)</span>
            <span>Varian {variant.name} (Kanan)</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderPos}
            onChange={(e) => setSliderPos(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
          <span className="text-xs text-zinc-500 font-mono">
            {sourceTexture.width}×{sourceTexture.height} piksel
          </span>

          <a
            href={variant.dataUrl}
            download={`${variant.name}.png`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {variant.name}.png</span>
          </a>
        </div>
      </div>
    </div>
  );
};
