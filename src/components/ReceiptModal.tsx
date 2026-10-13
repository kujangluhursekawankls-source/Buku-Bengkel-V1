import React, { useState } from 'react';
import {
  Printer,
  X,
  Share2,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Edit,
  Ban,
} from 'lucide-react';
import type { Transaction, WorkshopProfile } from '../types/bengkel.js';
import { formatRupiah, formatDateTime } from '../utils/formatters.js';
import { generateReceiptPDF } from '../utils/pdfReceipt.js';

interface ReceiptModalProps {
  transaction: Transaction;
  profile: WorkshopProfile;
  onClose: () => void;
  onEdit?: (trx: Transaction) => void;
  onCancel?: (trx: Transaction) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  profile,
  onClose,
  onEdit,
  onCancel,
}) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm' | 'normal'>('80mm');

  // WhatsApp share modal state
  const [showWaShareModal, setShowWaShareModal] = useState(false);
  const [waPhone, setWaPhone] = useState(
    transaction.customer_phone ? transaction.customer_phone.replace(/[^0-9]/g, '') : ''
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = transaction.status === 'CANCELLED';

  // Normalize phone number to 628...
  const normalizePhoneNumber = (raw: string) => {
    let cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const handleOpenWaModal = () => {
    setShareSuccessMessage(null);
    setShareErrorMessage(null);
    setShowWaShareModal(true);
  };

  const handleSendWaPDF = async (forceWebShare?: boolean) => {
    const receiptElement = document.getElementById('printable-receipt');
    if (!receiptElement) {
      setShareErrorMessage('Elemen nota tidak ditemukan');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(waPhone);
    if (!normalizedPhone || normalizedPhone.length < 9) {
      setShareErrorMessage('Masukkan nomor WhatsApp yang valid (contoh: 081234567890)');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setShareErrorMessage(null);
      setShareSuccessMessage(null);

      // Generate PDF with the currently selected paper format (58mm, 80mm, or A4)
      const { file, blobUrl } = await generateReceiptPDF(receiptElement, transaction.invoice_no, paperWidth);

      const workshopName = profile.name || 'Bengkel';
      const itemsCount = (transaction.items?.length || 0) + (transaction.services?.length || 0);
      const captionText = `Halo kak ${transaction.customer_name || 'Pelanggan'}! Terima kasih telah berkunjung ke *${workshopName}*.\n\nBerikut nota transaksi resmi Anda:\n- *No. Nota:* ${transaction.invoice_no}\n- *Tanggal:* ${formatDateTime(transaction.date)}\n- *Jumlah Item/Jasa:* ${itemsCount}\n- *Total Tagihan:* ${formatRupiah(transaction.total_amount)} (${transaction.payment_method})\n\nTerlampir file PDF Nota Transaksi resmi. Simpan nota ini sebagai bukti transaksi dan garansi servis Anda.`;

      // Check if browser supports Web Share API with files (Android Chrome, etc.)
      const nav = navigator as any;
      const canShareFiles = nav.canShare && nav.canShare({ files: [file] });

      if (forceWebShare || (canShareFiles && forceWebShare !== false)) {
        try {
          await nav.share({
            files: [file],
            title: `Nota ${transaction.invoice_no} - ${workshopName}`,
            text: captionText,
          });
          setShareSuccessMessage('Nota PDF berhasil dibagikan ke WhatsApp!');
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            // User cancelled share picker
            return;
          }
          console.warn('Web Share API error, fallback to WhatsApp web link:', shareErr);
        }
      }

      // Fallback: Trigger direct PDF download, then open WhatsApp chat link
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = file.name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Open official WhatsApp link
      const waUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
        captionText + '\n\n*(File PDF nota telah otomatis terunduh ke perangkat Anda, silakan lampirkan file dokumen tersebut di chat ini)*'
      )}`;
      window.open(waUrl, '_blank');

      setShareSuccessMessage('File PDF nota berhasil diunduh ke perangkat Anda dan WhatsApp telah dibuka. Silakan kirim pesan dan lampirkan file PDF tersebut.');
    } catch (err: any) {
      console.error(err);
      setShareErrorMessage(err.message || 'Gagal membuat file PDF nota');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Stamp config
  const stamp = profile.stamp_config;
  const isStampActive = stamp && stamp.enabled && stamp.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:w-full print:rounded-none">
        {/* Header toolbar (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 p-3.5 sm:p-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Nota Transaksi</h3>
              <p className="text-[11px] font-mono text-slate-500">{transaction.invoice_no}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition ${
                  paperWidth === '58mm' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition ${
                  paperWidth === '80mm' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                80mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('normal')}
                className={`hidden sm:inline-block px-2 py-1.5 rounded-md text-[11px] font-medium transition ${
                  paperWidth === 'normal' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                A4
              </button>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100/70 print:bg-white print:p-0">
          <div
            id="printable-receipt"
            className={`mx-auto bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs print:border-none print:shadow-none print:p-0 text-slate-900 font-mono text-xs transition-all relative ${
              paperWidth === '58mm'
                ? 'max-w-[280px] text-[11px]'
                : paperWidth === '80mm'
                ? 'max-w-[360px] text-xs'
                : 'max-w-md text-xs'
            }`}
          >
            {/* Cancellation watermark if cancelled */}
            {isCancelled && (
              <div className="mb-3 rounded-lg border border-rose-300 bg-rose-50 p-2 text-center text-xs font-bold text-rose-700">
                [ TRANSAKSI TELAH DIBATALKAN ]
                {transaction.cancellation_reason && (
                  <p className="mt-0.5 font-normal text-[10px] text-rose-600">Alasan: {transaction.cancellation_reason}</p>
                )}
              </div>
            )}

            {/* Workshop Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              {profile.logo_url && (
                <div className="flex justify-center mb-2">
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    className="h-12 w-auto max-w-[120px] object-contain"
                  />
                </div>
              )}
              <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900 leading-tight">
                {profile.name || 'BENGKEL KENDARAAN'}
              </h1>
              {profile.tagline && <p className="text-[11px] text-slate-600 font-medium mt-0.5">{profile.tagline}</p>}
              {profile.address && <p className="text-[10px] text-slate-600 leading-tight mt-0.5">{profile.address}</p>}
              {profile.phone && <p className="text-[10px] text-slate-600 mt-0.5">Telp/WA: {profile.phone}</p>}
            </div>

            {/* Transaction Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold text-slate-800">{transaction.invoice_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDateTime(transaction.date)}</span>
              </div>
              {transaction.customer_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan:</span>
                  <span className="font-semibold">{transaction.customer_name}</span>
                </div>
              )}
              {transaction.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">No. HP:</span>
                  <span>{transaction.customer_phone}</span>
                </div>
              )}
              {transaction.vehicle_info && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Kendaraan:</span>
                  <span className="font-semibold">{transaction.vehicle_info}</span>
                </div>
              )}
            </div>

            {/* Items & Services Breakdown */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <div className="text-[10px] font-bold uppercase text-slate-500 pb-1.5 flex justify-between">
                <span>Rincian Item / Jasa</span>
                <span>Subtotal</span>
              </div>
              <div className="space-y-2">
                {/* Items */}
                {transaction.items && transaction.items.map((item, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-medium text-slate-900">{item.item_name}</div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>{item.qty} {item.unit} x {formatRupiah(item.sell_price)}</span>
                      <span className="font-medium text-slate-800">{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}

                {/* Services */}
                {transaction.services && transaction.services.map((srv, idx) => (
                  <div key={`srv-${idx}`} className="text-[11px]">
                    <div className="font-medium text-slate-900">[JASA] {srv.name}</div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>{srv.qty}x @ {formatRupiah(srv.price)}</span>
                      <span className="font-medium text-slate-800">{formatRupiah(srv.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-teal-700">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(transaction.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200 text-slate-900">
                <span>TOTAL AKHIR:</span>
                <span>{formatRupiah(transaction.total_amount)}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 text-slate-600">
                <span>Metode Bayar:</span>
                <span className="font-semibold uppercase">{transaction.payment_method}</span>
              </div>
              {transaction.payment_method === 'TUNAI' && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Uang Diterima:</span>
                    <span>{formatRupiah(transaction.amount_received)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-800">
                    <span className="text-slate-500">Kembalian:</span>
                    <span>{formatRupiah(transaction.change_amount)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Signature & Stamp Section */}
            <div className="pt-3 pb-1 flex justify-between items-end relative min-h-[75px] overflow-visible">
              <div className="text-[10px] text-slate-500 z-10">
                <p>Konsumen,</p>
                <div className="h-10"></div>
                <p>({transaction.customer_name || '....................'})</p>
              </div>

              <div className="text-right text-[10px] text-slate-500 z-10">
                <p>Hormat Kami,</p>
                <div className="h-10"></div>
                <p>({profile.name || 'Kasir Bengkel'})</p>
              </div>

              {/* Stempel Toko Overlay (Bebas diatur: menumpuk ttd, pojok kanan, pojok kiri, atau tengah) */}
              {isStampActive && (
                <div
                  className="absolute pointer-events-none select-none z-20"
                  style={{
                    width: `${stamp.size || 85}px`,
                    bottom: stamp.position === 'signature-overlap' ? '6px' : '0px',
                    right: stamp.position === 'signature-overlap' ? '12px' : stamp.position === 'bottom-right' ? '0px' : 'auto',
                    left: stamp.position === 'bottom-left' ? '0px' : stamp.position === 'bottom-center' ? '50%' : 'auto',
                    transform: `${stamp.position === 'bottom-center' ? 'translateX(-50%) ' : ''}translate(${stamp.offset_x || 0}px, ${stamp.offset_y || 0}px) rotate(-8deg)`,
                    opacity: stamp.opacity ?? 0.85,
                  }}
                >
                  <img
                    src={stamp.image_url}
                    alt="Stempel Toko"
                    className="w-full h-auto object-contain mix-blend-multiply"
                  />
                </div>
              )}
            </div>

            {/* Notes & Footer */}
            <div className="pt-2 text-center text-[10px] text-slate-600 space-y-1 border-t border-dashed border-slate-200 mt-2">
              {transaction.notes && (
                <p className="italic text-slate-500 text-[10px]">Catatan: {transaction.notes}</p>
              )}
              <p className="font-medium text-slate-800">
                {profile.receipt_footer || 'Terima kasih atas kunjungan dan kepercayaan Anda!'}
              </p>
              <p className="text-[9px] text-slate-400">Dicetak melalui BengkelPro Online</p>
            </div>
          </div>
        </div>

        {/* Footer actions: Android-friendly touch targets (min 44px) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100 p-3 sm:p-4 bg-white rounded-b-2xl print:hidden">
          <div className="text-xs text-slate-500 hidden sm:block">
            Mendukung thermal printer 58mm/80mm & PDF WhatsApp
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Tombol Edit Nota */}
            {!isCancelled && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl border border-amber-300 bg-amber-50 px-3.5 text-xs font-bold text-amber-900 hover:bg-amber-100 active:scale-95 transition flex items-center justify-center gap-1.5"
                title="Edit data atau item nota"
              >
                <Edit className="w-3.5 h-3.5 text-amber-700" />
                <span>Edit Nota</span>
              </button>
            )}

            {/* Tombol Batalkan Nota */}
            {!isCancelled && onCancel && (
              <button
                onClick={() => {
                  onClose();
                  onCancel(transaction);
                }}
                className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl border border-rose-300 bg-rose-50 px-3.5 text-xs font-bold text-rose-800 hover:bg-rose-100 active:scale-95 transition flex items-center justify-center gap-1.5"
                title="Batalkan nota ini dan kembalikan stok"
              >
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                <span>Batalkan</span>
              </button>
            )}

            {/* Tombol Kirim WA */}
            <button
              onClick={handleOpenWaModal}
              className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim WA</span>
            </button>

            {/* Tombol Print (Sesuai Ketentuan 2: Diubah menjadi "Print") */}
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl bg-teal-600 px-5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition flex items-center justify-center"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: KIRIM NOTA PDF KE WHATSAPP PELANGGAN */}
      {showWaShareModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Send className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kirim Nota PDF via WhatsApp</h3>
                  <p className="text-[11px] text-slate-500">{transaction.invoice_no}</p>
                </div>
              </div>
              <button
                onClick={() => setShowWaShareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {shareErrorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{shareErrorMessage}</span>
              </div>
            )}

            {shareSuccessMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{shareSuccessMessage}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Pelanggan *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="tel"
                    value={waPhone}
                    onChange={e => setWaPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                {/* Pratinjau Normalisasi Nomor */}
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Normalisasi otomatis:</span>
                  {normalizePhoneNumber(waPhone).length >= 9 ? (
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      +{normalizePhoneNumber(waPhone)}
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">Ketik nomor HP valid (08...)</span>
                  )}
                </div>
              </div>

              {/* Pratinjau Ringkasan Pesan Sebelum Dikirimkan */}
              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Ringkasan Pesan Pengantar WA:</span>
                  <span className="text-[10px] font-semibold text-teal-700 uppercase bg-teal-50 px-1.5 py-0.5 rounded">
                    PDF {paperWidth}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[10.5px] text-slate-700 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-line">
                  {`Halo kak ${transaction.customer_name || 'Pelanggan'}! Terima kasih telah berkunjung ke *${profile.name || 'Bengkel'}*.

Berikut rincian nota resmi Anda:
• No. Nota: ${transaction.invoice_no}
• Total: ${formatRupiah(transaction.total_amount)} (${transaction.payment_method})
${isStampActive ? '• Dilengkapi Stempel Resmi Toko\n' : ''}
(File PDF nota resmi terlampir)`}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Tautan WhatsApp menggunakan protokol resmi <code>https://wa.me/</code> dengan dokumen PDF resolusi tinggi.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowWaShareModal(false)}
                  className="w-1/3 h-11 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSendWaPDF(true)}
                  disabled={isGeneratingPdf || normalizePhoneNumber(waPhone).length < 9}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Membuat PDF...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim ke WhatsApp</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tombol alternatif unduh langsung jika ingin melampirkan secara manual */}
              <button
                type="button"
                onClick={() => handleSendWaPDF(false)}
                disabled={isGeneratingPdf || normalizePhoneNumber(waPhone).length < 9}
                className="w-full text-center py-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition"
              >
                Atau unduh PDF & buka WhatsApp Web
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
