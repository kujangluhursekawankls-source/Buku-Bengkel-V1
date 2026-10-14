import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'pc'>('android');

  // Determine the best clean URL to share/install
  const getAppUrl = () => {
    if (typeof window !== 'undefined') {
      const href = window.location.href;
      // In AI Studio, replace dev URL with pre (public shareable) URL for end-users
      if (href.includes('ais-dev-')) {
        return href.replace('ais-dev-', 'ais-pre-').split('?')[0];
      }
      return window.location.origin;
    }
    return 'https://ais-pre-icjbiw4hcgkjiex2ftrvzo-339488771069.asia-southeast1.run.app';
  };

  const appUrl = getAppUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(
    appUrl
  )}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Gagal menyalin link:', e);
    }
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setShowModal(false);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {compact ? (
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
          title="Pasang aplikasi di layar utama HP / Komputer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang di HP</span>
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
          title="Pasang aplikasi di layar utama perangkat"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isInstalled ? 'Aplikasi Terpasang' : 'Pasang di HP / PC'}</span>
        </button>
      )}

      {/* Installation & Share Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-xs text-white">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Pasang Aplikasi di HP / Laptop
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </h3>
                  <p className="text-xs text-teal-100">
                    Aplikasi PWA resmi: Tanpa Play Store, ringan, cepat, dan online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-slate-700">
              {/* Direct 1-Click Install if supported */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-teal-900">Perangkat Mendukung Pasang Langsung!</h4>
                    <p className="text-[11px] text-teal-700">
                      Klik tombol ini untuk memasang BengkelPro langsung ke layar utama sekarang.
                    </p>
                  </div>
                  <button
                    onClick={handleDirectInstall}
                    className="shrink-0 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md hover:bg-teal-700 active:scale-95 transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Sekarang</span>
                  </button>
                </div>
              )}

              {/* QR Code and Share Link */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>Scan QR Code atau Buka Link di HP</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0 text-center">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code Aplikasi Bengkel"
                      className="w-32 h-32 object-contain rounded-lg"
                      loading="lazy"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Scan pakai kamera HP</span>
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Arahkan kamera HP mekanik/kasir ke QR Code di samping, atau salin link di bawah dan kirim lewat WhatsApp:
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={appUrl}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 select-all font-mono truncate focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                          copied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                        title="Salin Link Aplikasi"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                      >
                        <span>Buka langsung di tab baru</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Instructions Selector */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Petunjuk Pemasangan Sesuai Perangkat:
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setActivePlatform('android')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      activePlatform === 'android'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Android</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePlatform('ios')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      activePlatform === 'ios'
                        ? 'bg-slate-800 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>iPhone (iOS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePlatform('pc')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      activePlatform === 'pc'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Komputer / PC</span>
                  </button>
                </div>

                {/* Android Steps */}
                {activePlatform === 'android' && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5 text-xs text-slate-700">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                      Buka link aplikasi di browser <strong>Google Chrome</strong> di HP Anda.
                    </div>
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                      Ketuk tombol <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser Chrome.
                    </div>
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                      Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.
                    </div>
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                      Ketuk <strong>"Install / Tambah"</strong>. Icon <strong>BengkelPro</strong> otomatis muncul di layar utama HP dan dapat dibuka layar penuh seperti aplikasi resmi!
                    </div>
                  </div>
                )}

                {/* iPhone Steps */}
                {activePlatform === 'ios' && (
                  <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-2.5 text-xs text-slate-700">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">1</span>
                      Buka link di browser bawaan <strong>Safari</strong> di iPhone/iPad (bukan dari browser dalam WhatsApp).
                    </div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">2</span>
                      Ketuk ikon <strong>Bagikan / Share</strong> (ikon kotak dengan panah ke atas) di bagian bawah layar.
                    </div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">3</span>
                      Gulir ke bawah dan ketuk <strong>"Add to Home Screen" (Tambahkan ke Layar Utama)</strong>.
                    </div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">4</span>
                      Ketuk <strong>"Add / Tambah"</strong> di pojok kanan atas. Aplikasi selesai terpasang!
                    </div>
                  </div>
                )}

                {/* PC / Laptop Steps */}
                {activePlatform === 'pc' && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2.5 text-xs text-slate-700">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                      Buka link di browser <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong> di laptop/komputer kasir.
                    </div>
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                      Perhatikan di ujung kanan <strong>Bilah Alamat (Address Bar)</strong>, klik ikon komputer kecil dengan tanda panah ke bawah (ikon Install).
                    </div>
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                      Atau klik menu <strong>Titik Tiga (⋮)</strong> ➡️ pilih <strong>"Install BengkelPro"</strong>.
                    </div>
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
                      Aplikasi akan terbuka mandiri di jendela tersendiri tanpa tab browser dan ada shortcut di Desktop PC!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
