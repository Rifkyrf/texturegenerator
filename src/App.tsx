import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TextureUploader } from './components/TextureUploader';
import { InteractiveCanvasPicker } from './components/InteractiveCanvasPicker';
import { ColorPaletteManager } from './components/ColorPaletteManager';
import { TextureVariantsGrid } from './components/TextureVariantsGrid';
import { Block3DPreviewModal } from './components/Block3DPreviewModal';
import { CompareModal } from './components/CompareModal';
import {
  DyeColor,
  GeneratedVariant,
  RecolorSettings,
  SampleTexture,
  TextureFile,
} from './types';
import {
  DEFAULT_MINECRAFT_DYES,
  hexToRgb,
} from './utils/colorUtils';
import { SAMPLE_TEXTURES } from './utils/sampleTextures';
import {
  generateAllVariants,
  getImageDataFromElement,
} from './utils/recolorEngine';
import { Image as ImageIcon, Sliders, FolderArchive } from 'lucide-react';

export default function App() {
  // Theme state: dark or light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mc_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Default sample texture: Wool Block
  const defaultSample = SAMPLE_TEXTURES[0];

  const [currentTexture, setCurrentTexture] = useState<TextureFile>({
    name: defaultSample.id,
    dataUrl: defaultSample.dataUrl,
    width: 16,
    height: 16,
  });

  const [activeSampleId, setActiveSampleId] = useState<string | null>(defaultSample.id);
  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(null);

  // Recolor settings
  const [settings, setSettings] = useState<RecolorSettings>({
    sourceColorHex: defaultSample.sourceColorHex,
    sourceRgb: hexToRgb(defaultSample.sourceColorHex),
    tolerance: defaultSample.tolerance,
    strength: 1.0,
    mode: defaultSample.mode,
    preserveAlpha: true,
  });

  // Default colors: 15 dye colors enabled (matching Python script default)
  const [colors, setColors] = useState<DyeColor[]>(() =>
    DEFAULT_MINECRAFT_DYES.map((c) => ({
      ...c,
      enabled: c.id !== 'white',
    }))
  );

  // Generated variants state
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);

  // Active modals
  const [active3DVariant, setActive3DVariant] = useState<GeneratedVariant | null>(null);
  const [activeCompareVariant, setActiveCompareVariant] = useState<GeneratedVariant | null>(null);

  // Section refs for smooth mobile scrolling
  const sectionPickerRef = useRef<HTMLDivElement | null>(null);
  const sectionPaletteRef = useRef<HTMLDivElement | null>(null);
  const sectionResultsRef = useRef<HTMLDivElement | null>(null);

  // Load ImageData whenever currentTexture dataUrl changes
  useEffect(() => {
    if (!currentTexture.dataUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const data = getImageDataFromElement(img);
      setSourceImageData(data);
    };
    img.src = currentTexture.dataUrl;
  }, [currentTexture.dataUrl]);

  // Compute all variants whenever sourceImageData, colors, or settings change
  const computeVariants = useCallback(async () => {
    if (!sourceImageData || !currentTexture) return;

    try {
      const result = await generateAllVariants(
        currentTexture,
        sourceImageData,
        colors,
        settings
      );
      setVariants(result);
    } catch (err) {
      console.error('Error generating variants', err);
    }
  }, [sourceImageData, currentTexture, colors, settings]);

  // Debounce variant recomputation for smooth sliders
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      computeVariants();
    }, 80);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [computeVariants]);

  // Handler for uploading new custom texture
  const handleTextureLoaded = (texture: TextureFile) => {
    setCurrentTexture(texture);
    setActiveSampleId(null);
  };

  // Handler for selecting sample texture
  const handleSelectSample = (sample: SampleTexture) => {
    setCurrentTexture({
      name: sample.id,
      dataUrl: sample.dataUrl,
      width: 16,
      height: 16,
    });
    setActiveSampleId(sample.id);
    setSettings((prev) => ({
      ...prev,
      sourceColorHex: sample.sourceColorHex,
      sourceRgb: hexToRgb(sample.sourceColorHex),
      tolerance: sample.tolerance,
      mode: sample.mode,
    }));
  };

  // Handler when user picks color via eyedropper canvas or mobile palette
  const handleEyedropperSelect = (hex: string, rgb: [number, number, number]) => {
    setSettings((prev) => ({
      ...prev,
      sourceColorHex: hex,
      sourceRgb: rgb,
    }));
  };

  const handleUpdateSettings = (partial: Partial<RecolorSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleResetColors = () => {
    setColors(
      DEFAULT_MINECRAFT_DYES.map((c) => ({
        ...c,
        enabled: c.id !== 'white',
      }))
    );
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* Mobile Quick Jump Bar (Floating / sticky for easy phone navigation) */}
      <div className="sm:hidden sticky top-[53px] z-30 bg-white/95 dark:bg-zinc-900/95 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center justify-between gap-1 shadow-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={() => scrollToSection(sectionPickerRef)}
          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1"
        >
          <ImageIcon className="w-3 h-3 text-emerald-500" />
          <span>Tekstur</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection(sectionPaletteRef)}
          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1"
        >
          <Sliders className="w-3 h-3 text-amber-500" />
          <span>Warna</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection(sectionResultsRef)}
          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white flex items-center justify-center gap-1 shadow-sm"
        >
          <FolderArchive className="w-3 h-3" />
          <span>Hasil ({variants.length})</span>
        </button>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-5 sm:gap-6">
        {/* Step 1: Upload or Choose Sample Texture */}
        <div>
          <TextureUploader
            currentTexture={currentTexture}
            onTextureLoaded={handleTextureLoaded}
            onSelectSample={handleSelectSample}
            activeSampleId={activeSampleId}
          />
        </div>

        {/* Step 2: Interactive Eyedropper & Pixel Inspector + 1-Tap Mobile Palette */}
        <div ref={sectionPickerRef} className="scroll-mt-24 sm:scroll-mt-20">
          <InteractiveCanvasPicker
            sourceTexture={currentTexture}
            sourceImageData={sourceImageData}
            settings={settings}
            onSelectColor={handleEyedropperSelect}
          />
        </div>

        {/* Step 3: Color Palette Manager (Source Color & 15/16 Dyes + Custom Colors) */}
        <div ref={sectionPaletteRef} className="scroll-mt-24 sm:scroll-mt-20">
          <ColorPaletteManager
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            colors={colors}
            onUpdateColors={setColors}
            onResetColors={handleResetColors}
          />
        </div>

        {/* Step 4: Real-time Generated Texture Variants & Batch Download ZIP */}
        <div ref={sectionResultsRef} className="scroll-mt-24 sm:scroll-mt-20">
          <TextureVariantsGrid
            variants={variants}
            sourceTexture={currentTexture}
            onOpen3DModal={(variant) => setActive3DVariant(variant)}
            onOpenCompareModal={(variant) => setActiveCompareVariant(variant)}
          />
        </div>
      </main>

      {/* 3D Minecraft Block Preview Modal */}
      <Block3DPreviewModal
        variant={active3DVariant}
        onClose={() => setActive3DVariant(null)}
      />

      {/* Before / After Comparison Modal */}
      <CompareModal
        sourceTexture={currentTexture}
        variant={activeCompareVariant}
        onClose={() => setActiveCompareVariant(null)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-5 mt-10 text-center text-xs text-zinc-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>
            Minecraft Texture Dye Recolor Studio • Siap Hosting di Vercel
          </p>
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <span>Mobile Friendly</span>
            <span>•</span>
            <span>100% Client-Side Processing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
