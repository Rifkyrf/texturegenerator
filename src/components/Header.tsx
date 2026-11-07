import React, { useState } from 'react';
import { Sparkles, HelpCircle, FileCode, CheckCircle2, X, Sun, Moon } from 'lucide-react';

interface Props {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<Props> = ({ theme, onToggleTheme }) => {
  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-zinc-900 rounded-[10px] flex items-center justify-center">
              <span className="font-mono text-base sm:text-lg">⛏</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                Minecraft Dye Recolor
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Vercel Ready
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 hidden xs:block truncate">
              Auto-generate 16 varian dye Minecraft dari 1 PNG
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dark / Light Mode Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center"
            aria-label="Toggle Dark / Light Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="hidden sm:inline">Panduan</span>
          </button>
        </div>
      </div>

      {/* Help & Documentation Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Panduan Penggunaan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <div className="bg-emerald-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-emerald-200 dark:border-zinc-800">
                <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 100% Client-Side & Vercel Ready
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Semua pemrosesan tekstur berjalan di browser (HTML5 Canvas). Tidak membutuhkan server Python ataupun koneksi internet setelah halaman terbuka. Siap dihosting langsung di Vercel, Netlify, atau GitHub Pages.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mb-1">
                  1. Memilih Warna pada HP / Layar Sentuh
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Kini telah disediakan daftar <strong>Warna Terdeteksi</strong> di bawah kanvas. Cukup tap salah satu kotak warna pada daftar tersebut untuk langsung memilih warna tanpa perlu menargetkan piksel kecil secara manual. Anda juga dapat menggunakan tombol Zoom (+ / -) hingga 48x.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mb-1">
                  2. Opsi 15/16 Warna Dye & Custom
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Bisa memilih varian mana saja yang ingin digenerate (default 15 warna seperti di skrip Python Anda), atau tambahkan warna buatan sendiri dengan tombol <strong>Tambah Warna</strong>.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mb-1">
                  3. Unduh Batch ZIP
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Klik <strong>Download Semua ZIP</strong> untuk mengunduh semua varian sekaligus dalam satu file ZIP yang siap diekstrak ke folder resource pack Minecraft Anda.
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
