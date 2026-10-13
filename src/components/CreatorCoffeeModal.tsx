import React, { useState } from 'react';
import {
  Coffee,
  X,
  Copy,
  Check,
  Heart,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface CreatorCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorCoffeeModal: React.FC<CreatorCoffeeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const gopayNumber = '08179015181';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(gopayNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 border border-amber-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition active:scale-95"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Coffee Icon */}
        <div className="flex items-center gap-3 pr-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Traktir Kopi Pengembang</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">Bagi Kopi Pembuat</h3>
          </div>
        </div>

        {/* Creator Identity Info */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-500 font-medium">Pembuat:</span>
            <span className="font-bold text-slate-900 text-right">Jamhur</span>
          </div>
          <div className="flex items-start justify-between gap-2 border-t border-slate-200/60 pt-2">
            <span className="text-slate-500 font-medium">Facebook:</span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal-700 hover:text-teal-800 text-right inline-flex items-center gap-1 underline decoration-teal-300"
            >
              <span>Kujang Luhur sekawan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Gopay Card with Copy Button */}
        <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-950">Nomor GoPay Donasi</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              GoPay
            </span>
          </div>

          <div className="flex items-center justify-between bg-white rounded-xl border border-emerald-200/80 px-3.5 py-2.5 shadow-2xs">
            <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-wider">
              {gopayNumber}
            </span>
            <button
              onClick={handleCopy}
              className={`h-9 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin No</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-tight">
            Ketuk tombol <strong>Salin No</strong> untuk menyalin nomor GoPay secara langsung ke clipboard.
          </p>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-1 text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <span>Terima kasih atas apresiasi dan dukungan Anda</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>

        {/* Close Button Full Width */}
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
