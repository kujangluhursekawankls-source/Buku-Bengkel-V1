import React, { useState, useEffect } from 'react';
import { Send, X, Copy, ExternalLink, Check, AlertCircle, Calendar } from 'lucide-react';
import { api } from '../utils/api.js';
import type { WorkshopProfile } from '../types/bengkel.js';

interface WhatsAppReportModalProps {
  profile: WorkshopProfile;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const WhatsAppReportModal: React.FC<WhatsAppReportModalProps> = ({
  profile,
  onClose,
  onOpenSettings,
}) => {
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly' | 'custom'>('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [waData, setWaData] = useState<{
    boss_whatsapp: string;
    message_text: string;
    whatsapp_url: string;
  } | null>(null);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWhatsAppPreview(period, startDate, endDate);
      setWaData(res);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat ringkasan laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [period, startDate, endDate]);

  const handleCopy = () => {
    if (waData?.message_text) {
      navigator.clipboard.writeText(waData.message_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendWhatsApp = () => {
    if (!waData?.whatsapp_url) {
      alert('Nomor WhatsApp atasan belum disetel. Silakan isi di menu Pengaturan Bengkel terlebih dahulu.');
      return;
    }
    window.open(waData.whatsapp_url, '_blank');
  };

  const hasBossNumber = !!profile.boss_whatsapp && profile.boss_whatsapp.trim().length > 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Send className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Kirim Ringkasan Laporan ke WhatsApp</h3>
              <p className="text-xs text-slate-500">Format ringkas otomatis untuk atasan / pemilik bengkel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Boss Phone Status */}
          <div className={`rounded-xl p-3 text-xs flex items-center justify-between ${
            hasBossNumber ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            <div>
              <span className="font-semibold">Tujuan Nomor Atasan:</span>{' '}
              <span className="font-mono">{profile.boss_whatsapp || '(Belum disetel di Pengaturan)'}</span>
            </div>
            <button
              onClick={onOpenSettings}
              className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
            >
              Ubah Nomor
            </button>
          </div>

          {/* Period selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Periode Laporan:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('today')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                  period === 'today'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setPeriod('weekly')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                  period === 'weekly'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                  period === 'monthly'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                  period === 'custom'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Rentang Kustom
              </button>
            </div>

            {period === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Dari Tanggal:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Sampai Tanggal:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Teks Pesan WhatsApp (Dibuat Nyata dari Database):</label>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>
            <div className="relative">
              {loading ? (
                <div className="h-44 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400">
                  Memuat data laporan terkini...
                </div>
              ) : (
                <textarea
                  readOnly
                  rows={9}
                  value={waData?.message_text || ''}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-800 resize-none select-all focus:outline-hidden"
                />
              )}
            </div>
          </div>

          {/* Explanation note */}
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200/80">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p leading-tight>
              Menekan tombol kirim akan membuka tautan resmi <strong>WhatsApp Click to Chat</strong> dengan pesan yang sudah terisi otomatis. Anda dapat meninjau dan menekan tombol kirim di WhatsApp.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Tutup
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={!hasBossNumber}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 ${
                hasBossNumber
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-emerald-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Buka WhatsApp & Kirim</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
