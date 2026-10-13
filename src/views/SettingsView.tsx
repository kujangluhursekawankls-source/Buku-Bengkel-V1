import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Building2,
  Phone,
  MessageSquare,
  FileText,
  Upload,
  Database,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  ShieldCheck,
  History,
  Stamp,
  RotateCcw,
} from 'lucide-react';
import { api } from '../utils/api.js';
import type { WorkshopProfile, ActivityLog, StampConfig } from '../types/bengkel.js';
import { formatDateTime } from '../utils/formatters.js';

interface SettingsViewProps {
  profile: WorkshopProfile;
  onProfileUpdated: (newProfile: WorkshopProfile) => void;
}

const defaultStampConfig: StampConfig = {
  enabled: false,
  image_url: '',
  size: 85,
  position: 'signature-overlap',
  opacity: 0.85,
  offset_x: 0,
  offset_y: 0,
};

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'stamp' | 'whatsapp' | 'database' | 'backup' | 'logs'>('profile');

  // Profile Form state
  const [formData, setFormData] = useState<WorkshopProfile>({
    ...profile,
    stamp_config: profile.stamp_config ? { ...defaultStampConfig, ...profile.stamp_config } : { ...defaultStampConfig },
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);

  // Database & Supabase state
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; url: string; hasKey: boolean } | null>(null);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Activity logs
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Restore file input ref
  const restoreFileRef = useRef<HTMLInputElement>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    setFormData({
      ...profile,
      stamp_config: profile.stamp_config ? { ...defaultStampConfig, ...profile.stamp_config } : { ...defaultStampConfig },
    });
  }, [profile]);

  useEffect(() => {
    loadDatabaseStatus();
  }, []);

  const loadDatabaseStatus = async () => {
    try {
      const [status, schemaData] = await Promise.all([
        api.getDatabaseStatus(),
        api.getSqlSchema(),
      ]);
      setDbStatus(status);
      setSqlSchema(schemaData.sql);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await api.getLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setSaveError(null);
      const res = await api.updateProfile(formData);
      onProfileUpdated(res.profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadDatabaseStatus();
    } catch (err: any) {
      setSaveError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (file: File, type: 'logo' | 'banner' | 'stamp') => {
    if (!file) return;
    try {
      if (type === 'logo') setUploadingLogo(true);
      else if (type === 'banner') setUploadingBanner(true);
      else setUploadingStamp(true);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadImage(base64);
        if (uploadRes.success) {
          let updated: WorkshopProfile;
          if (type === 'stamp') {
            updated = {
              ...formData,
              stamp_config: {
                ...(formData.stamp_config || defaultStampConfig),
                image_url: uploadRes.url,
                enabled: true,
              },
            };
          } else {
            updated = {
              ...formData,
              [type === 'logo' ? 'logo_url' : 'banner_url']: uploadRes.url,
            };
          }
          setFormData(updated);
          const saveRes = await api.updateProfile(updated);
          onProfileUpdated(saveRes.profile);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah gambar');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else if (type === 'banner') setUploadingBanner(false);
      else setUploadingStamp(false);
    }
  };

  const handleResetStampConfig = () => {
    const currentUrl = formData.stamp_config?.image_url || '';
    setFormData({
      ...formData,
      stamp_config: {
        ...defaultStampConfig,
        image_url: currentUrl,
        enabled: !!currentUrl,
      },
    });
  };

  const handleTestWhatsApp = () => {
    const raw = formData.boss_whatsapp?.replace(/[^0-9]/g, '');
    if (!raw) {
      alert('Nomor WhatsApp atasan belum diisi');
      return;
    }
    const testMsg = encodeURIComponent(
      `Halo! Ini adalah pesan uji coba koneksi dari sistem manajemen *${formData.name || 'Bengkel'}*. Fitur notifikasi dan laporan siap digunakan!`
    );
    window.open(`https://wa.me/${raw}?text=${testMsg}`, '_blank');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleExportBackup = () => {
    window.location.href = '/api/backup/export';
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Peringatan: Pemulihan data akan memperbarui seluruh database dengan isi file cadangan. Lanjutkan?')) {
      if (restoreFileRef.current) restoreFileRef.current.value = '';
      return;
    }

    try {
      setRestoring(true);
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await api.restoreBackup(parsed);
      alert(res.message || 'Data berhasil dipulihkan!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Gagal memulihkan file cadangan');
    } finally {
      setRestoring(false);
      if (restoreFileRef.current) restoreFileRef.current.value = '';
    }
  };

  const stampConfig = formData.stamp_config || defaultStampConfig;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pengaturan Bengkel & Sistem</h2>
        <p className="text-xs text-slate-500">
          Atur profil, stempel toko, nomor WhatsApp atasan, database Supabase, dan pencadangan.
        </p>
      </div>

      {/* Settings Navigation Tabs (Mobile-friendly horizontal scroll) */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 py-3 px-4 font-semibold border-b-2 whitespace-nowrap transition h-11 ${
            activeTab === 'profile'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil & Nota</span>
        </button>

        {/* Tab Stempel Toko */}
        <button
          onClick={() => setActiveTab('stamp')}
          className={`flex items-center gap-1.5 py-3 px-4 font-semibold border-b-2 whitespace-nowrap transition h-11 ${
            activeTab === 'stamp'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stamp className="w-4 h-4" />
          <span>Stempel Toko</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-1.5 py-3 px-4 font-semibold border-b-2 whitespace-nowrap transition h-11 ${
            activeTab === 'whatsapp'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Atasan</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-1.5 py-3 px-4 font-semibold border-b-2 whitespace-nowrap transition h-11 ${
            activeTab === 'database'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Online</span>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-1.5 py-3 px-4 font-semibold border-b-2 whitespace-nowrap transition h-11 ${
            activeTab === 'backup'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Backup & Restore</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('logs');
            loadLogs();
          }}
          className={`flex items-center gap-1.5 py-3 px-4 font-semibold border-b-2 whitespace-nowrap transition h-11 ${
            activeTab === 'logs'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Audit</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Pengaturan bengkel berhasil diperbarui dan tersimpan di database online.</span>
        </div>
      )}

      {saveError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {saveError}
        </div>
      )}

      {/* TAB 1: PROFIL & NOTA */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Identitas & Kontak Bengkel
            </h3>

            {/* Logo and Banner Uploaders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              {/* Logo */}
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 flex flex-col justify-between space-y-2">
                <span className="text-xs font-semibold text-slate-700">Logo Bengkel (Untuk Nota & Header)</span>
                {formData.logo_url ? (
                  <div className="flex items-center gap-3 my-1">
                    <img src={formData.logo_url} alt="Logo" className="h-16 w-16 object-contain rounded-lg border bg-white p-1" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: '' })}
                      className="text-xs text-rose-600 underline"
                    >
                      Hapus Logo
                    </button>
                  </div>
                ) : (
                  <div className="my-1 border border-dashed border-slate-300 rounded-lg p-3 text-center text-xs text-slate-400">
                    Belum ada logo terunggah
                  </div>
                )}
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleUploadImage(e.target.files[0], 'logo')}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Mengunggah...' : 'Unggah Logo (PNG/JPG)'}</span>
                </button>
              </div>

              {/* Banner */}
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 flex flex-col justify-between space-y-2">
                <span className="text-xs font-semibold text-slate-700">Banner Dashboard (Header Bengkel)</span>
                {formData.banner_url ? (
                  <div className="flex items-center gap-3 my-1">
                    <img src={formData.banner_url} alt="Banner" className="h-16 w-28 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, banner_url: '' })}
                      className="text-xs text-rose-600 underline"
                    >
                      Hapus Banner
                    </button>
                  </div>
                ) : (
                  <div className="my-1 border border-dashed border-slate-300 rounded-lg p-3 text-center text-xs text-slate-400">
                    Belum ada banner terunggah
                  </div>
                )}
                <input
                  type="file"
                  ref={bannerInputRef}
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleUploadImage(e.target.files[0], 'banner')}
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBanner ? 'Mengunggah...' : 'Unggah Banner (PNG/JPG)'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Bengkel *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: BENGKEL MOTOR JAYA ABADI"
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline / Slogan</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Contoh: Servis Cepat, Bergaransi, & Terpercaya"
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon Toko / Kasir</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pesan Footer Pada Nota</label>
                <input
                  type="text"
                  value={formData.receipt_footer}
                  onChange={e => setFormData({ ...formData, receipt_footer: e.target.value })}
                  placeholder="Terima kasih atas kunjungan Anda! Garansi servis 7 hari."
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap Bengkel</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Raya Otomotif No. 12, Kel. Maju Jaya, Kec. Sukses..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto h-12 sm:h-11 rounded-xl bg-teal-600 px-6 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition disabled:opacity-50"
            >
              {saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PENGATURAN STEMPEL TOKO (Fitur Baru Revisi 1) */}
      {activeTab === 'stamp' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Stamp className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pengaturan Stempel Toko pada Nota</h3>
                  <p className="text-[11px] text-slate-500">Unggah cap/stempel bengkel untuk dicetak otomatis pada nota dan PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetStampConfig}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                title="Kembalikan ukuran dan posisi awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Awal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Form Upload & Controls */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                {/* Toggle Enable Stamp */}
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Tampilkan Stempel pada Nota</span>
                    <span className="text-[11px] text-slate-500">Otomatis muncul pada nota cetak thermal, A4, dan kirim WA</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stampConfig.enabled}
                      onChange={e => setFormData({
                        ...formData,
                        stamp_config: { ...stampConfig, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* Upload Stamp Button */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    File Gambar Stempel (Format PNG transparan disarankan, JPG/JPEG)
                  </label>
                  <input
                    type="file"
                    ref={stampInputRef}
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleUploadImage(e.target.files[0], 'stamp')}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => stampInputRef.current?.click()}
                      disabled={uploadingStamp}
                      className="h-11 flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingStamp ? 'Mengunggah Stempel...' : 'Unggah Stempel Baru'}</span>
                    </button>
                    {stampConfig.image_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          stamp_config: { ...stampConfig, image_url: '', enabled: false }
                        })}
                        className="h-11 px-3 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                {/* Stamp Size Slider */}
                <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-slate-700">Ukuran Stempel (Lebar)</label>
                    <span className="font-mono font-bold text-teal-700">{stampConfig.size} px</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="150"
                    step="5"
                    value={stampConfig.size}
                    onChange={e => setFormData({
                      ...formData,
                      stamp_config: { ...stampConfig, size: Number(e.target.value) }
                    })}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Kecil (45px)</span>
                    <span>Standar (85px)</span>
                    <span>Besar (150px)</span>
                  </div>
                </div>

                {/* Position Preset Selection */}
                <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-white">
                  <label className="font-semibold text-slate-700 block mb-1">Posisi Peletakan Stempel:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        stamp_config: { ...stampConfig, position: 'signature-overlap', offset_x: 0, offset_y: 0 }
                      })}
                      className={`h-10 text-left px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                        stampConfig.position === 'signature-overlap'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Menumpuk Tanda Tangan</span>
                      {stampConfig.position === 'signature-overlap' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        stamp_config: { ...stampConfig, position: 'bottom-right', offset_x: 0, offset_y: 0 }
                      })}
                      className={`h-10 text-left px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                        stampConfig.position === 'bottom-right'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Pojok Kanan Bawah</span>
                      {stampConfig.position === 'bottom-right' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        stamp_config: { ...stampConfig, position: 'bottom-center', offset_x: 0, offset_y: 0 }
                      })}
                      className={`h-10 text-left px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                        stampConfig.position === 'bottom-center'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Tengah Bawah</span>
                      {stampConfig.position === 'bottom-center' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        stamp_config: { ...stampConfig, position: 'bottom-left', offset_x: 0, offset_y: 0 }
                      })}
                      className={`h-10 text-left px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                        stampConfig.position === 'bottom-left'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Pojok Kiri Bawah</span>
                      {stampConfig.position === 'bottom-left' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                  </div>
                </div>

                {/* Fine-Tuning Coordinates (Offset X / Y) */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Geser Kiri/Kanan: <span className="font-mono text-teal-700">{stampConfig.offset_x || 0}px</span>
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="2"
                      value={stampConfig.offset_x || 0}
                      onChange={e => setFormData({
                        ...formData,
                        stamp_config: { ...stampConfig, offset_x: Number(e.target.value) }
                      })}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Geser Atas/Bawah: <span className="font-mono text-teal-700">{stampConfig.offset_y || 0}px</span>
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="2"
                      value={stampConfig.offset_y || 0}
                      onChange={e => setFormData({
                        ...formData,
                        stamp_config: { ...stampConfig, offset_y: Number(e.target.value) }
                      })}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveProfile()}
                    disabled={saving}
                    className="w-full h-12 rounded-xl bg-teal-600 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition"
                  >
                    {saving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Stempel'}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Visual Preview of Receipt Signature with Stamp */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-700 mb-2">Pratinjau Stempel pada Nota:</span>
                <div className="w-full max-w-[280px] bg-white border border-slate-300 rounded-xl p-4 shadow-xs font-mono text-xs select-none">
                  <div className="text-center pb-2 border-b border-dashed border-slate-200 text-[10px] text-slate-400">
                    ... (Rincian Total & Pembayaran) ...
                  </div>

                  {/* Simulated Signature Area */}
                  <div className="pt-4 pb-2 flex justify-between items-end relative min-h-[90px] overflow-visible">
                    <div className="text-[10px] text-slate-400 z-10">
                      <p>Konsumen,</p>
                      <div className="h-10"></div>
                      <p>(Pelanggan)</p>
                    </div>

                    <div className="text-right text-[10px] text-slate-600 z-10">
                      <p>Hormat Kami,</p>
                      <div className="h-10"></div>
                      <p>({formData.name || 'Kasir Bengkel'})</p>
                    </div>

                    {/* Stempel Toko Preview */}
                    {stampConfig.image_url ? (
                      <div
                        className="absolute pointer-events-none transition-all z-20"
                        style={{
                          width: `${stampConfig.size || 85}px`,
                          bottom: stampConfig.position === 'signature-overlap' ? '6px' : '0px',
                          right: stampConfig.position === 'signature-overlap' ? '12px' : stampConfig.position === 'bottom-right' ? '0px' : 'auto',
                          left: stampConfig.position === 'bottom-left' ? '0px' : stampConfig.position === 'bottom-center' ? '50%' : 'auto',
                          transform: `${stampConfig.position === 'bottom-center' ? 'translateX(-50%) ' : ''}translate(${stampConfig.offset_x || 0}px, ${stampConfig.offset_y || 0}px) rotate(-8deg)`,
                          opacity: stampConfig.opacity ?? 0.85,
                        }}
                      >
                        <img
                          src={stampConfig.image_url}
                          alt="Pratinjau Stempel"
                          className="w-full h-auto object-contain mix-blend-multiply"
                        />
                      </div>
                    ) : (
                      <div className="absolute right-0 bottom-2 border border-dashed border-slate-300 rounded-full w-14 h-14 flex items-center justify-center text-[9px] text-slate-300">
                        (Stempel)
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-2 border-t border-dashed border-slate-200 text-[9px] text-slate-400">
                    {stampConfig.enabled ? '✓ Stempel aktif' : '✗ Stempel nonaktif'}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-3 max-w-[260px]">
                  Stempel otomatis disesuaikan ukurannya dan tidak mengganggu elemen baris teks nota lainnya.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP ATASAN */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Nomor WhatsApp Atasan / Pemilik Bengkel</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nomor ini digunakan untuk mengirimkan ringkasan laporan keuangan harian dan bulanan secara langsung.
            </p>

            <div className="space-y-3 text-xs max-w-lg">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Atasan (Format Internasional: 628...) *
                </label>
                <input
                  type="text"
                  value={formData.boss_whatsapp}
                  onChange={e => setFormData({ ...formData, boss_whatsapp: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="Contoh: 6281234567890"
                  className="w-full h-11 font-mono text-sm rounded-xl border border-slate-300 px-3 focus:border-emerald-500 focus:outline-hidden font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Gunakan format internasional tanpa tanda + atau spasi, contoh: 6281234567890.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={saving}
                  className="h-11 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Nomor WA'}
                </button>
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  className="h-11 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Uji Buka WA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE ONLINE */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span>Penyimpanan Database Online</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-800">Server DB Aktif</span>
              </div>
            </div>

            <div className="rounded-xl bg-teal-50/70 border border-teal-200 p-4 text-xs text-teal-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                Penyimpanan Online Tanpa Perlu Login
              </p>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Seluruh data transaksi, stok suku cadang, dan kasir tersimpan permanen di database server dan tetap aman saat browser ditutup atau dibuka dari perangkat HP lain.
              </p>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <h4 className="font-bold text-slate-800">Koneksi Supabase (Opsional):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supabase URL</label>
                  <input
                    type="text"
                    value={formData.supabase_url || ''}
                    onChange={e => setFormData({ ...formData, supabase_url: e.target.value })}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full h-11 rounded-xl border border-slate-300 px-3 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supabase Key</label>
                  <input
                    type="password"
                    value={formData.supabase_anon_key || ''}
                    onChange={e => setFormData({ ...formData, supabase_anon_key: e.target.value })}
                    placeholder="eyJhbGciOi..."
                    className="w-full h-11 rounded-xl border border-slate-300 px-3 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={saving}
                  className="h-11 rounded-xl bg-teal-600 px-5 font-bold text-white hover:bg-teal-700"
                >
                  Simpan Kredensial Supabase
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800">Skrip SQL Migrasi:</h4>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin' : 'Salin SQL'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={6}
                value={sqlSchema}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[10px] text-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-600" />
              <span>Cadangan & Pemulihan Database (Backup & Restore)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-teal-600" />
                    <span>Unduh Cadangan JSON</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Menghasilkan file arsip database lengkap mencakup stok, transaksi, jasa, stempel, dan laporan.
                  </p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="w-full h-11 inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 text-xs font-bold text-white hover:bg-teal-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>Pulihkan dari File Cadangan</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Pulihkan data bengkel dari file <code>.json</code> cadangan jika berpindah perangkat atau ponsel baru.
                  </p>
                </div>
                <input
                  type="file"
                  ref={restoreFileRef}
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleRestoreFile}
                />
                <button
                  onClick={() => restoreFileRef.current?.click()}
                  disabled={restoring}
                  className="w-full h-11 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{restoring ? 'Memulihkan Data...' : 'Pilih File JSON & Pulihkan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LOG AUDIT */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              <span>Log Audit Sistem</span>
            </h3>
            <button onClick={loadLogs} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
            {loadingLogs ? (
              <div className="py-12 text-center text-slate-400">Memuat log aktivitas...</div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">Belum ada aktivitas tercatat.</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-[10px] text-slate-800 uppercase px-2 py-0.5 rounded-md bg-slate-100 mr-2">
                      {log.action}
                    </span>
                    <span className="font-medium text-slate-900">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
