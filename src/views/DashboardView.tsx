import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Receipt,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ShoppingCart,
  Calendar,
  Layers,
  Printer,
  PackageX,
  RefreshCw,
  Wallet,
  Building2,
  Phone,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../utils/api.js';
import type { DashboardStats, Transaction, Item, WorkshopProfile } from '../types/bengkel.js';
import { formatRupiah, formatDateTime } from '../utils/formatters.js';

interface DashboardViewProps {
  profile: WorkshopProfile;
  onNavigate: (tab: 'dashboard' | 'inventory' | 'cashier' | 'reports' | 'settings') => void;
  onViewReceipt: (trx: Transaction) => void;
  onRestockItem?: (item: Item) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  onNavigate,
  onViewReceipt,
  onRestockItem,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerLoadError, setBannerLoadError] = useState(false);

  useEffect(() => {
    setBannerLoadError(false);
  }, [profile.banner_url]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasBanner = Boolean(profile.banner_url && profile.banner_url.trim() && !bannerLoadError);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HERO BANNER SECTION (Banner tampil penuh membentang dengan overlay kontras tinggi) */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-800/40 bg-slate-950 text-white min-h-[185px] sm:min-h-[210px] flex flex-col justify-between">
        {/* Background Banner Image or Gradient Fallback */}
        {hasBanner ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img
              src={profile.banner_url}
              alt={profile.name || 'Banner Bengkel'}
              onError={() => {
                console.warn('Gagal memuat banner dari URL:', profile.banner_url);
                setBannerLoadError(true);
              }}
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700"
            />
            {/* Dark gradient overlay for guaranteed text contrast across all devices */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40" />
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950">
            {/* Subtle workshop grid texture for premium fallback */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}

        {/* Content over banner: purely informative, no buttons */}
        <div className="relative z-10 p-4 sm:p-6 flex flex-col justify-between flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                {profile.logo_url && (
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    className="h-8 w-8 object-contain rounded-lg bg-white p-0.5 shadow-xs"
                  />
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                  {profile.name || 'Bengkel Motor & Mobil'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {profile.tagline || 'Ringkasan & Informasi Operasional'}
              </h2>
              {profile.address && (
                <p className="text-[11px] text-slate-300 flex items-center gap-1.5 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{profile.address}</span>
                </p>
              )}
              {profile.phone && (
                <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Kontak / WA: {profile.phone}</span>
                </p>
              )}
            </div>

            {/* Informational Status Badge Only */}
            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-teal-400 text-xs font-semibold backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span>Sistem Online Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 sm:p-4 text-xs font-medium text-rose-800">
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid (Mobile-friendly: 2 cols on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Omzet Hari Ini */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Omzet Hari Ini</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900">
              {formatRupiah(stats?.today_revenue ?? 0)}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500 truncate">
              {stats?.today_transactions_count ?? 0} transaksi berhasil hari ini
            </div>
          </div>
        </div>

        {/* Total Omzet Akumulatif */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Total Pemasukan</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900">
              {formatRupiah(stats?.total_income ?? 0)}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500 truncate">
              Akumulasi nota tersimpan
            </div>
          </div>
        </div>

        {/* Laba Kotor */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Estimasi Laba Kotor</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-emerald-600">
              {formatRupiah(stats?.gross_profit ?? 0)}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500 truncate">
              Omzet minus modal barang
            </div>
          </div>
        </div>

        {/* Pengeluaran Operasional */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Pengeluaran</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900">
              {formatRupiah(stats?.total_expense ?? 0)}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500 truncate">
              Laba bersih: <span className="font-semibold text-slate-800">{formatRupiah(stats?.net_profit ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Low Stock Warning & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Low Stock Items */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Stok Menipis</h3>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              (stats?.low_stock_count ?? 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {stats?.low_stock_count ?? 0} Barang
            </span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto max-h-[300px] space-y-2">
            {(!stats?.low_stock_items || stats.low_stock_items.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                  <PackageX className="w-5 h-5" />
                </div>
                <span>Semua stok berada di atas batas minimum.</span>
              </div>
            ) : (
              stats.low_stock_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/50 p-2.5 sm:p-3 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">[{item.code}]</div>
                    <div className="mt-0.5 text-[11px] font-medium text-amber-800">
                      Sisa: <strong className="text-rose-600 font-bold">{item.stock} {item.unit}</strong> (Min: {item.min_stock})
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-amber-800 shadow-2xs">
                      Perlu Restock
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Total {stats?.low_stock_count ?? 0} jenis barang memerlukan pengadaan ulang
          </div>
        </div>

        {/* Right Column: Recent Transactions (Purely informative, no buttons) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <Receipt className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Transaksi Terbaru</h3>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Riwayat Transaksi Terakhir
            </span>
          </div>

          <div className="mt-3 flex-1 overflow-x-auto">
            {(!stats?.recent_transactions || stats.recent_transactions.length === 0) ? (
              <div className="py-10 text-center text-xs text-slate-400">
                <p>Belum ada transaksi yang tercatat di database.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs min-w-[320px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400 font-semibold">
                    <th className="py-2 px-2 sm:px-3">No. Nota</th>
                    <th className="py-2 px-2 sm:px-3">Pelanggan / Kendaraan</th>
                    <th className="py-2 px-2 sm:px-3 text-right">Total</th>
                    <th className="py-2 px-2 sm:px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent_transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-2 sm:px-3 font-mono font-bold text-slate-800">
                        <div>{trx.invoice_no}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{formatDateTime(trx.date)}</div>
                      </td>
                      <td className="py-2.5 px-2 sm:px-3">
                        <div className="font-medium text-slate-800 line-clamp-1">
                          {trx.customer_name || 'Pelanggan Umum'}
                        </div>
                        {trx.vehicle_info && (
                          <div className="text-[10px] text-slate-500 font-mono line-clamp-1">
                            {trx.vehicle_info}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 sm:px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(trx.total_amount)}
                      </td>
                      <td className="py-2.5 px-2 sm:px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trx.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {trx.status === 'CANCELLED' ? 'Dibatalkan' : 'Selesai'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
