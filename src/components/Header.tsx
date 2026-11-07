import React, { useState } from 'react';
import { Sparkles, HelpCircle, FileCode, CheckCircle2, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <span className="font-mono text-lg font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-200">
                ⛏
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
                Minecraft Dye Recolor Studio
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Vercel Ready
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Generator varian 16 warna dye Minecraft otomatis dari 1 tekstur sumber PNG
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Panduan & Skrip Python</span>
          </button>
        </div>
      </div>

      {/* Help & Documentation Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-zinc-100">
                  Panduan Penggunaan & Kompatibilitas Skrip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                <h4 className="font-semibold text-emerald-400 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 100% Client-Side & Siap Vercel
                </h4>
                <p className="text-zinc-400">
                  Aplikasi ini berjalan murni di browser pengguna menggunakan HTML5 Canvas. Tidak memerlukan server backend atau instalasi Python/Pillow lokal. Anda bisa langsung deploy ke Vercel, Netlify, atau Cloudflare Pages dengan 1 klik!
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-100 text-sm mb-1">
                  1. Bagaimana Cara Memilih Warna dari PNG jika Lupa Hex / RGB?
                </h4>
                <p className="text-zinc-400">
                  Gunakan panel <strong>Eyedropper & Pixel Inspector</strong>. Cukup arahkan kursor ke gambar tekstur untuk melihat kaca pembesar dan koordinat pixel, lalu klik pixel manapun. Warna sumber akan otomatis disetel ke hex dan RGB pixel tersebut!
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-100 text-sm mb-1">
                  2. Memilih Varian Warna (15 Warna, 16 Warna, atau Custom)
                </h4>
                <p className="text-zinc-400">
                  Di panel Varian Warna, Anda bisa mencentang/mematikan warna dye yang diinginkan, menambah warna kustom baru dengan picker, atau menggunakan preset (15 warna dye tanpa putih sesuai skrip Python asli Anda, atau 16 warna lengkap).
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-100 text-sm mb-1">
                  3. Kompatibel dengan colors.json Skrip Python
                </h4>
                <p className="text-zinc-400 mb-2">
                  Anda bisa menekan tombol <strong>Impor JSON</strong> untuk mengimpor file <code className="bg-zinc-800 px-1 py-0.5 rounded text-emerald-300">colors.json</code> dari komputer Anda, atau menekan <strong>Ekspor</strong> untuk menyimpan palet warna dalam format yang sama:
                </p>
                <pre className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`{
  "black": "#1D1D21",
  "red": "#B02E26",
  "green": "#5E7C16",
  "blue": "#3C44AA",
  "custom_ruby": "#FF1744"
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-100 text-sm mb-1">
                  4. Unduh Sekaligus dalam Format ZIP
                </h4>
                <p className="text-zinc-400">
                  Tekan tombol <strong>Download Semua ZIP</strong> untuk mengunduh semua varian tekstur PNG yang dipilih dalam 1 arsip ZIP yang rapi, lengkap dengan file <code className="text-emerald-300">palette_info.txt</code> untuk resource pack Minecraft Anda.
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
