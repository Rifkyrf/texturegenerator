import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Search,
  Box,
  FolderArchive,
  Eye,
} from 'lucide-react';
import JSZip from 'jszip';
import { GeneratedVariant, TextureFile } from '../types';
import { getContrastTextColor } from '../utils/colorUtils';

interface Props {
  variants: GeneratedVariant[];
  sourceTexture: TextureFile | null;
  onOpen3DModal: (variant: GeneratedVariant) => void;
  onOpenCompareModal: (variant: GeneratedVariant) => void;
}

export const TextureVariantsGrid: React.FC<Props> = ({
  variants,
  sourceTexture,
  onOpen3DModal,
  onOpenCompareModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [namePrefix, setNamePrefix] = useState<string>(
    sourceTexture ? `${sourceTexture.name}_` : ''
  );
  const [previewZoom, setPreviewZoom] = useState<number>(4);

  // Update prefix when sourceTexture changes
  React.useEffect(() => {
    if (sourceTexture) {
      setNamePrefix(`${sourceTexture.name}_`);
    }
  }, [sourceTexture]);

  const filteredVariants = variants.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.labelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.hex.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Download Single PNG
  const handleDownloadSingle = (variant: GeneratedVariant) => {
    const filename = `${namePrefix}${variant.name}.png`;
    const a = document.createElement('a');
    a.href = variant.dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async (variant: GeneratedVariant) => {
    try {
      if (variant.blob && typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({ 'image/png': variant.blob });
        await navigator.clipboard.write([item]);
        setCopiedId(variant.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      // Fallback
      alert('Browser tidak mengizinkan penyalinan gambar otomatis. Gunakan tombol Download PNG.');
    }
  };

  // Batch Download as ZIP using JSZip
  const handleDownloadAllZip = async () => {
    if (variants.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folderName = sourceTexture ? `${sourceTexture.name}_textures` : 'minecraft_textures';
      const folder = zip.folder(folderName) || zip;

      for (const variant of variants) {
        const filename = `${namePrefix}${variant.name}.png`;
        if (variant.blob) {
          folder.file(filename, variant.blob);
        } else {
          // Convert base64 dataUrl to binary
          const base64Data = variant.dataUrl.split(',')[1];
          folder.file(filename, base64Data, { base64: true });
        }
      }

      // Also create a readme.txt with palette info
      const infoText = `Minecraft Texture Variants\nGenerated with Minecraft Dye Recolor Studio\nTotal Variants: ${variants.length}\nDate: ${new Date().toISOString()}\n\nIncluded Textures:\n` +
        variants.map((v) => `- ${namePrefix}${v.name}.png (${v.hex})`).join('\n');
      folder.file('palette_info.txt', infoText);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to create ZIP', err);
      alert('Terjadi kesalahan saat membuat file ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      {/* Top Header & Batch Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400">
            <FolderArchive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
              Hasil Varian Tekstur
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                {variants.length} Varian Dibuat
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Pratinjau langsung resolusi piksel Minecraft & unduh satuan atau sekaligus dalam format ZIP
            </p>
          </div>
        </div>

        {/* Batch Actions & Filename Config */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Prefix input */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 mr-1">Prefix:</span>
            <input
              type="text"
              value={namePrefix}
              onChange={(e) => setNamePrefix(e.target.value)}
              placeholder="wool_"
              className="w-20 sm:w-24 bg-transparent font-mono text-zinc-100 focus:outline-none"
            />
            <span className="text-zinc-500 font-mono">[nama].png</span>
          </div>

          {/* Download ZIP Button */}
          <button
            type="button"
            disabled={variants.length === 0 || isZipping}
            onClick={handleDownloadAllZip}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Mengompres ZIP...' : `Download Semua ZIP (${variants.length})`}</span>
          </button>
        </div>
      </div>

      {/* Filter and Zoom Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
        <div className="relative flex-1 min-w-44 max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari warna (red, cyan, dll)..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Ukuran Tampilan:</span>
          {[2, 4, 6].map((zoomVal) => (
            <button
              key={zoomVal}
              type="button"
              onClick={() => setPreviewZoom(zoomVal)}
              className={`px-2 py-0.5 rounded-md border text-xs font-mono transition-colors ${
                previewZoom === zoomVal
                  ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {zoomVal * 16}px
            </button>
          ))}
        </div>
      </div>

      {/* Variants Grid */}
      {filteredVariants.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
          <p className="text-sm text-zinc-400">Tidak ada varian yang cocok dengan pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {filteredVariants.map((variant) => {
            const contrast = getContrastTextColor(variant.hex);
            const isCopied = copiedId === variant.id;

            return (
              <div
                key={variant.id}
                className="group relative bg-zinc-950 border border-zinc-800/90 hover:border-emerald-500/50 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-950/20"
              >
                {/* Texture Display Box */}
                <div className="relative bg-checkerboard rounded-xl p-3 flex items-center justify-center overflow-hidden border border-zinc-800/80 mb-2.5">
                  <img
                    src={variant.dataUrl}
                    alt={variant.name}
                    className="pixelated object-contain transition-transform group-hover:scale-110 drop-shadow-md"
                    style={{
                      width: `${variant.width * previewZoom}px`,
                      height: `${variant.height * previewZoom}px`,
                      maxWidth: '100%',
                      maxHeight: '120px',
                    }}
                  />

                  {/* Top-right quick 3D block preview trigger */}
                  <button
                    type="button"
                    onClick={() => onOpen3DModal(variant)}
                    title="Lihat dalam Blok 3D Minecraft"
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-zinc-900/90 text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-700/60"
                  >
                    <Box className="w-3.5 h-3.5" />
                  </button>

                  {/* Top-left compare trigger */}
                  <button
                    type="button"
                    onClick={() => onOpenCompareModal(variant)}
                    title="Bandingkan dengan Asli"
                    className="absolute top-1.5 left-1.5 p-1 rounded-md bg-zinc-900/90 text-zinc-400 hover:text-sky-300 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-700/60"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details & Color Pill */}
                <div className="flex flex-col gap-1.5 mb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-200 capitalize truncate">
                      {variant.name}
                    </span>
                    <div
                      className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: variant.hex }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>{variant.hex}</span>
                    <span className="text-zinc-500">{namePrefix}{variant.name}.png</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(variant)}
                    className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-emerald-600 hover:text-white text-zinc-300 border border-zinc-800 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    title={`Download ${namePrefix}${variant.name}.png`}
                  >
                    <Download className="w-3 h-3" />
                    <span>PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyImage(variant)}
                    className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Salin gambar ke papan klip"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
