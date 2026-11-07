import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { SampleTexture, TextureFile } from '../types';
import { SAMPLE_TEXTURES } from '../utils/sampleTextures';

interface Props {
  currentTexture: TextureFile | null;
  onTextureLoaded: (texture: TextureFile, file?: File) => void;
  onSelectSample: (sample: SampleTexture) => void;
  activeSampleId: string | null;
}

export const TextureUploader: React.FC<Props> = ({
  currentTexture,
  onTextureLoaded,
  onSelectSample,
  activeSampleId,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    if (!file.type.includes('image')) {
      alert('Mohon pilih file gambar (PNG disarankan untuk tekstur Minecraft).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onTextureLoaded(
          {
            name: file.name.replace(/\.[^/.]+$/, ''),
            dataUrl,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          },
          file
        );
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm transition-colors">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Tekstur Minecraft Sumber
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Unggah PNG dari galeri/file HP Anda atau coba sampel bawaan
            </p>
          </div>
        </div>

        {currentTexture && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Ganti File
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Drag and Drop / Touch Upload Box */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-6 border-2 border-dashed rounded-xl p-4 sm:p-5 cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
              : 'border-zinc-300 dark:border-zinc-700/80 hover:border-emerald-500/60 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2.5 shadow-sm">
            <UploadCloud className="w-5 h-5" />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-200">
            Tap untuk unggah gambar PNG dari HP / Komputer
          </p>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Mendukung 16×16, 32×32, 64×64, atau ukuran apapun
          </p>

          {currentTexture && (
            <div className="mt-2.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="truncate max-w-40">{currentTexture.name}.png</span>
              <span className="text-zinc-400">
                ({currentTexture.width}×{currentTexture.height})
              </span>
            </div>
          )}
        </div>

        {/* Built-in Sample Textures Carousel */}
        <div className="md:col-span-6 flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Contoh Tekstur Bawaan:
              </span>
              <span className="text-[10px] text-zinc-500">1-Tap Pakai</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SAMPLE_TEXTURES.map((sample) => {
                const isSelected = activeSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => onSelectSample(sample)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-checkerboard border border-zinc-300 dark:border-zinc-700 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={sample.dataUrl}
                        alt={sample.name}
                        className="w-full h-full object-contain pixelated"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate leading-tight">
                        {sample.name.split(' (')[0]}
                      </span>
                      <span className="text-[10px] text-zinc-500 capitalize">
                        {sample.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-lg p-2 flex items-center justify-between">
            <span>Tekstur aktif:</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-44">
              {currentTexture?.name || 'Belum dipilih'} ({currentTexture?.width || 0}×{currentTexture?.height || 0}px)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
