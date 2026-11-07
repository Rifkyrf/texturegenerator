import React, { useState, useRef } from 'react';
import {
  Palette,
  Sliders,
  Plus,
  Trash2,
  Download,
  Upload,
  CheckSquare,
  Square,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { DyeColor, RecolorMode, RecolorSettings } from '../types';
import {
  PRESET_PALETTES,
  exportColorsToJson,
  getContrastTextColor,
  hexToRgb,
  importColorsFromJson,
  rgbToHex,
} from '../utils/colorUtils';

interface Props {
  settings: RecolorSettings;
  onUpdateSettings: (settings: Partial<RecolorSettings>) => void;
  colors: DyeColor[];
  onUpdateColors: (colors: DyeColor[]) => void;
  onResetColors: () => void;
}

export const ColorPaletteManager: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  colors,
  onUpdateColors,
  onResetColors,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newColorName, setNewColorName] = useState<string>('');
  const [newColorHex, setNewColorHex] = useState<string>('#4AEDD9');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle source color input change
  const handleHexInputChange = (hex: string) => {
    let clean = hex.trim();
    if (!clean.startsWith('#') && clean.length > 0) clean = '#' + clean;
    const rgb = hexToRgb(clean);
    onUpdateSettings({
      sourceColorHex: clean,
      sourceRgb: rgb,
    });
  };

  const handleRgbChannelChange = (channel: 0 | 1 | 2, val: number) => {
    const clamped = Math.max(0, Math.min(255, isNaN(val) ? 0 : val));
    const newRgb: [number, number, number] = [...settings.sourceRgb];
    newRgb[channel] = clamped;
    const newHex = rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
    onUpdateSettings({
      sourceRgb: newRgb,
      sourceColorHex: newHex,
    });
  };

  // Toggle single color
  const handleToggleColor = (id: string) => {
    const next = colors.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    onUpdateColors(next);
  };

  // Toggle all
  const handleSelectAll = (select: boolean) => {
    const next = colors.map((c) => ({ ...c, enabled: select }));
    onUpdateColors(next);
  };

  // Add custom color
  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;

    const id = newColorName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const rgb = hexToRgb(newColorHex);

    const newColor: DyeColor = {
      id: `${id}_${Date.now()}`,
      name: newColorName.trim(),
      labelId: newColorName.trim(),
      hex: newColorHex.toUpperCase(),
      rgb,
      enabled: true,
      isCustom: true,
    };

    onUpdateColors([...colors, newColor]);
    setNewColorName('');
    setShowAddModal(false);
  };

  // Delete custom color
  const handleDeleteColor = (id: string) => {
    const next = colors.filter((c) => c.id !== id);
    onUpdateColors(next);
  };

  // Apply preset
  const handleApplyPreset = (presetId: string) => {
    const found = PRESET_PALETTES.find((p) => p.id === presetId);
    if (found) {
      onUpdateColors(found.colors);
    }
  };

  // Export JSON (matches colors.json format in Python script)
  const handleExportJson = () => {
    const jsonStr = exportColorsToJson(colors);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colors.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importColorsFromJson(text);
        onUpdateColors(imported);
        setJsonError(null);
      } catch (err: unknown) {
        setJsonError(err instanceof Error ? err.message : 'Gagal membaca file JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const enabledCount = colors.filter((c) => c.enabled).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT COLUMN: Source Color & Algorithm Tuning */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Source Color Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Pengaturan Warna Sumber
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Warna awal yang akan diganti ke varian dye
                </p>
              </div>
            </div>
          </div>

          {/* Color Preview & Inputs */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* Native color picker box */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={settings.sourceColorHex.length === 7 ? settings.sourceColorHex : '#FFFFFF'}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  className="w-13 h-13 rounded-xl cursor-pointer border-2 border-zinc-300 dark:border-zinc-700 bg-transparent opacity-0 absolute inset-0 z-10"
                  title="Pilih warna sumber"
                />
                <div
                  className="w-13 h-13 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 shadow-sm flex items-center justify-center transition-transform"
                  style={{ backgroundColor: settings.sourceColorHex }}
                >
                  <Palette
                    className="w-5 h-5 opacity-70"
                    style={{ color: getContrastTextColor(settings.sourceColorHex) }}
                  />
                </div>
              </div>

              {/* Hex Code Input */}
              <div className="flex-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Kode Hex
                </label>
                <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 focus-within:border-emerald-500 transition-colors">
                  <span className="text-zinc-400 font-mono text-sm mr-1">#</span>
                  <input
                    type="text"
                    value={settings.sourceColorHex.replace(/^#/, '')}
                    onChange={(e) => handleHexInputChange('#' + e.target.value)}
                    maxLength={6}
                    placeholder="FFFFFF"
                    className="w-full bg-transparent font-mono text-sm uppercase text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* RGB Channels Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              {(['R', 'G', 'B'] as const).map((label, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2"
                >
                  <label className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 block">
                    {label} (0-255)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={settings.sourceRgb[idx]}
                    onChange={(e) =>
                      handleRgbChannelChange(idx as 0 | 1 | 2, parseInt(e.target.value, 10))
                    }
                    className="w-full bg-transparent font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none mt-0.5"
                  />
                </div>
              ))}
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-zinc-500">Shortcut:</span>
              {[
                { name: 'Putih (#FFF)', hex: '#FFFFFF' },
                { name: 'Putih Wol', hex: '#EDEDED' },
                { name: 'Abu Muda', hex: '#9D9D97' },
                { name: 'Hitam', hex: '#1D1D21' },
              ].map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => handleHexInputChange(swatch.hex)}
                  className="px-2 py-0.5 text-[11px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {swatch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tolerance & Strength Sliders */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex flex-col gap-4">
            {/* Tolerance */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  Toleransi Warna (Tolerance)
                  <span
                    className="text-zinc-400 cursor-help"
                    title="Berapa jauh variasi warna piksel dari warna sumber yang masih dianggap cocok."
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                  {settings.tolerance}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                value={settings.tolerance}
                onChange={(e) => onUpdateSettings({ tolerance: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>0 (Ketat / Persis)</span>
                <span>Default: 10</span>
                <span>150 (Luas)</span>
              </div>
            </div>

            {/* Recolor Strength */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  Kekuatan Recolor (Strength)
                  <span
                    className="text-zinc-400 cursor-help"
                    title="Kekuatan penggantian warna (100% = penuh, di bawah 100% = blend halus seperti di skrip Python)."
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                  {Math.round(settings.strength * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={settings.strength}
                onChange={(e) => onUpdateSettings({ strength: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>10% (Halus)</span>
                <span>Default: 100%</span>
              </div>
            </div>

            {/* Algorithm Mode */}
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Metode Pewarnaan:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'shading_tint' as RecolorMode,
                    name: 'Natural Shading',
                    desc: 'Pertahankan bayangan & tekstur asli',
                  },
                  {
                    id: 'python_strict' as RecolorMode,
                    name: 'Skrip Python Asli',
                    desc: 'Penggantian toleransi RGB murni',
                  },
                  {
                    id: 'euclidean_tolerance' as RecolorMode,
                    name: 'Radius Euclidean',
                    desc: 'Toleransi radius bulat 3D',
                  },
                  {
                    id: 'multiply' as RecolorMode,
                    name: 'Multiply Blend',
                    desc: 'Campur tekstur gelap/terang',
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onUpdateSettings({ mode: mode.id })}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      settings.mode === mode.id
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{mode.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Target Dye Colors Selection & Custom Palettes */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm transition-colors">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  Varian Warna Dye ({enabledCount} Aktif)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Centang warna yang ingin digenerate atau tambahkan kustom
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Warna</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Impor colors.json"
                className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Impor</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleExportJson}
                title="Ekspor ke colors.json"
                className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ekspor</span>
              </button>
            </div>
          </div>

          {jsonError && (
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs">
              {jsonError}
            </div>
          )}

          {/* Palette Presets Dropdown / Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-zinc-500 font-medium mr-1">Preset:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('dyes_15_python')}
                className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer font-medium"
              >
                15 Dyes (Skrip Python)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('dyes_16')}
                className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                16 Dyes (Lengkap)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('minerals')}
                className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                Ores
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('pastel')}
                className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                Pastel
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Semua
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" /> Batal
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <button
                type="button"
                onClick={onResetColors}
                title="Reset warna ke default"
                className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Color Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {colors.map((color) => {
              const contrastColor = getContrastTextColor(color.hex);
              return (
                <div
                  key={color.id}
                  onClick={() => handleToggleColor(color.id)}
                  className={`relative p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 select-none ${
                    color.enabled
                      ? 'bg-zinc-50 dark:bg-zinc-950/90 border-zinc-300 dark:border-zinc-700/80 shadow-sm'
                      : 'bg-zinc-100/50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900 opacity-50'
                  }`}
                >
                  {/* Color Swatch */}
                  <div
                    className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/20 shadow-inner shrink-0 flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: color.hex, color: contrastColor }}
                  >
                    {color.enabled && '✓'}
                  </div>

                  {/* Name and Hex */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate capitalize">
                      {color.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      {color.hex}
                    </span>
                  </div>

                  {/* Delete button if custom color */}
                  {color.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteColor(color.id);
                      }}
                      title="Hapus warna kustom"
                      className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Tambah Warna Kustom */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Tambah Warna Kustom
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomColor} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nama Warna (contoh: ruby, teal, dark_blue)
                </label>
                <input
                  type="text"
                  required
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Contoh: dark_cyan atau ruby"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Pilih Warna (Hex atau Color Picker)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value.toUpperCase())}
                    className="w-12 h-10 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent"
                  />
                  <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 flex items-center">
                    <span className="text-zinc-400 font-mono text-sm mr-1">#</span>
                    <input
                      type="text"
                      value={newColorHex.replace(/^#/, '')}
                      onChange={(e) => setNewColorHex('#' + e.target.value.toUpperCase())}
                      maxLength={6}
                      className="w-full bg-transparent font-mono text-sm uppercase text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div
                className="p-3 rounded-xl border border-black/10 flex items-center justify-between shadow-sm"
                style={{ backgroundColor: newColorHex }}
              >
                <span
                  className="font-semibold text-sm capitalize"
                  style={{ color: getContrastTextColor(newColorHex) }}
                >
                  {newColorName || 'Pratinjau'}
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: getContrastTextColor(newColorHex) }}
                >
                  {newColorHex}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                >
                  Simpan Warna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
