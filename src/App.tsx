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

export default function App() {
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

  // Default colors list: 15 dye colors enabled (white disabled by default to match Python script)
  const [colors, setColors] = useState<DyeColor[]>(() =>
    DEFAULT_MINECRAFT_DYES.map((c) => ({
      ...c,
      enabled: c.id !== 'white', // 15 colors as in the user's Python script
    }))
  );

  // Generated variants state
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Active modals
  const [active3DVariant, setActive3DVariant] = useState<GeneratedVariant | null>(null);
  const [activeCompareVariant, setActiveCompareVariant] = useState<GeneratedVariant | null>(null);


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
    setIsProcessing(true);

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
    } finally {
      setIsProcessing(false);
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

  // Handler when user picks color via eyedropper canvas
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Step 1: Upload or Choose Sample Texture */}
        <TextureUploader
          currentTexture={currentTexture}
          onTextureLoaded={handleTextureLoaded}
          onSelectSample={handleSelectSample}
          activeSampleId={activeSampleId}
        />

        {/* Step 2: Interactive Eyedropper & Pixel Inspector */}
        <InteractiveCanvasPicker
          sourceTexture={currentTexture}
          sourceImageData={sourceImageData}
          settings={settings}
          onSelectColor={handleEyedropperSelect}
        />

        {/* Step 3: Color Palette Manager (Source Color & 15/16 Dyes + Custom Colors) */}
        <ColorPaletteManager
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          colors={colors}
          onUpdateColors={setColors}
          onResetColors={handleResetColors}
        />

        {/* Step 4: Real-time Generated Texture Variants & Batch Download ZIP */}
        <TextureVariantsGrid
          variants={variants}
          sourceTexture={currentTexture}
          onOpen3DModal={(variant) => setActive3DVariant(variant)}
          onOpenCompareModal={(variant) => setActiveCompareVariant(variant)}
        />
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

      {/* Clean Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Minecraft Texture Dye Recolor Studio • Dibuat untuk Modder & Resource Pack Creators
          </p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Client-Side Processing (0 Server Lag)</span>
            <span>•</span>
            <span>Vercel / SPA Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
