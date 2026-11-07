import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, Box, Download, SunMedium } from 'lucide-react';
import { GeneratedVariant } from '../types';

interface Props {
  variant: GeneratedVariant | null;
  onClose: () => void;
}

export const Block3DPreviewModal: React.FC<Props> = ({ variant, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationY, setRotationY] = useState<number>(45);
  const [rotationX, setRotationX] = useState<number>(25);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Auto rotation loop
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Render 3D Minecraft Isometric Cube on Canvas
  useEffect(() => {
    if (!variant) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = variant.dataUrl;
    img.onload = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Save canvas state
      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Disable image smoothing for sharp Minecraft pixels
      ctx.imageSmoothingEnabled = false;

      // Isometric projection geometry
      const size = 120; // half size of cube
      const radY = (rotationY * Math.PI) / 180;
      const radX = (rotationX * Math.PI) / 180;

      // Calculate projected 3D vertices
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);

      // Draw cube faces
      // Top face
      ctx.save();
      // Apply isometric skew for top face
      ctx.transform(cosY, sinY * sinX, -sinY, cosY * sinX, 0, -size * cosX);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      // Top face lighting tint (brightest)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();

      // Front / Left face
      ctx.save();
      ctx.transform(cosY, sinY * sinX, 0, cosX, -size * sinY * 0.5, size * 0.3);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      // Left face lighting tint (mid shadow)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();

      // Right face
      ctx.save();
      ctx.transform(-sinY, cosY * sinX, 0, cosX, size * cosY * 0.5, size * 0.3);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      // Right face lighting tint (darker shadow)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();

      // Drop shadow underneath
      ctx.beginPath();
      ctx.ellipse(0, size * 0.9, size * 0.9, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      ctx.restore();
    };
  }, [variant, rotationY, rotationX]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setRotationY((prev) => (prev + dx * 0.8) % 360);
    setRotationX((prev) => Math.max(-60, Math.min(60, prev - dy * 0.8)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!variant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100 capitalize">
                Pratinjau Blok 3D: {variant.name}
              </h3>
              <p className="text-xs text-zinc-400">
                Putar blok untuk melihat tampilan tekstur dari berbagai sudut
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

        {/* 3D Canvas Box */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative bg-zinc-950 border border-zinc-800/80 rounded-2xl h-72 flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
        >
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          <canvas
            ref={canvasRef}
            width={400}
            height={280}
            className="pixelated block relative z-10"
          />

          <div className="absolute bottom-3 left-3 text-[11px] text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800 backdrop-blur-sm">
            Drag mouse untuk memutar 3D
          </div>

          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors z-20 ${
              autoRotate
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5" />
            <span>{autoRotate ? 'Auto Putar: ON' : 'Auto Putar: OFF'}</span>
          </button>
        </div>

        {/* Footer info & Download single */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md border border-white/20"
              style={{ backgroundColor: variant.hex }}
            />
            <span className="font-mono text-xs text-zinc-300">{variant.hex}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">{variant.width}×{variant.height} px</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRotationX(25);
                setRotationY(45);
              }}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl text-xs border border-zinc-800"
              title="Reset Sudut Pandang"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <a
              href={variant.dataUrl}
              download={`${variant.name}.png`}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
