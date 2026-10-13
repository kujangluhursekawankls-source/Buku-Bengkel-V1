import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Send,
  Download,
  Plus,
  Trash2,
  TrendingUp,
  ArrowDownRight,
  Wallet,
  DollarSign,
  Package,
  Wrench,
  Printer,
  RefreshCw,
  X,
} from 'lucide-react';
import { api } from '../utils/api.js';
import type { FinancialReportSummary, Expense, WorkshopProfile, Transaction } from '../types/bengkel.js';
import { formatRupiah, formatDateTime, formatDate } from '../utils/formatters.js';

interface FinancialReportsViewProps {
  profile: WorkshopProfile;
  onOpenWhatsApp: () => void;
  onViewReceipt: (trx: Transaction) => void;
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  profile,
  onOpenWhatsApp,
  onViewReceipt,
}) => {
  const [periodType, setPeriodType] = useState<'today' | 'weekly' | 'monthly' | 'custom'>('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [report, setReport] = useState<FinancialReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Record Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('OPERASIONAL');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseReceipt, setExpenseReceipt] = useState('');
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Calculate dates based on periodType
  const handlePeriodChange = (type: 'today' | 'weekly' | 'monthly' | 'custom') => {
    setPeriodType(type);
    const today = new Date().toISOString().split('T')[0];

    if (type === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (type === 'weekly') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today);
    } else if (type === 'monthly') {
      const d = new Date();
      d.setDate(1);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getReports(startDate, endDate);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat laporan keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc.trim()) return;
    if (expenseAmount <= 0) {
      setExpenseError('Nominal harus lebih besar dari 0');
      return;
    }

    try {
      setExpenseSubmitting(true);
      setExpenseError(null);
      await api.createExpense({
        date: expenseDate,
        category: expenseCategory,
        description: expenseDesc.trim(),
        amount: expenseAmount,
        receipt_note: expenseReceipt.trim() || undefined,
      });

      setShowExpenseModal(false);
      setExpenseDesc('');
      setExpenseAmount(0);
      setExpenseReceipt('');
      loadReport();
    } catch (err: any) {
      setExpenseError(err.message || 'Gagal mencatat pengeluaran');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Yakin ingin menghapus catatan pengeluaran ini?')) return;
    try {
      await api.deleteExpense(id);
      loadReport();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pengeluaran');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'LAPORAN KEUANGAN BENGKEL\r\n';
    csvContent += `Nama Bengkel:,${profile.name || 'Bengkel'}\r\n`;
    csvContent += `Periode:,${report.period_label}\r\n\r\n`;

    csvContent += 'RINGKASAN KEUANGAN\r\n';
    csvContent += `Total Penjualan Barang,${report.parts_sales}\r\n`;
    csvContent += `Total Pendapatan Jasa,${report.service_revenue}\r\n`;
    csvContent += `Total Omzet/Pemasukan,${report.total_income}\r\n`;
    csvContent += `Harga Pokok Penjualan (HPP),${report.cogs_total}\r\n`;
    csvContent += `Estimasi Laba Kotor,${report.gross_profit}\r\n`;
    csvContent += `Biaya Operasional,${report.operational_expenses}\r\n`;
    csvContent += `Pembelian Persediaan,${report.inventory_purchases}\r\n`;
    csvContent += `Estimasi Laba Bersih,${report.net_profit}\r\n\r\n`;

    csvContent += 'DAFTAR TRANSAKSI\r\n';
    csvContent += 'No Nota,Tanggal,Pelanggan,Kendaraan,Barang (Rp),Jasa (Rp),Diskon (Rp),Total (Rp),Metode Bayar\r\n';
    report.transactions.forEach(t => {
      csvContent += `"${t.invoice_no}","${t.date}","${t.customer_name || '-'}","${t.vehicle_info || '-'}","${t.items_subtotal}","${t.services_subtotal}","${t.discount}","${t.total_amount}","${t.payment_method}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-bengkel-${startDate}-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Laporan Keuangan & Pengeluaran</h2>
          <p className="text-xs text-slate-500">
            Perhitungan omzet, laba kotor, dan laba bersih yang akurat dari database operasional nyata.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="h-11 sm:h-10 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Catat Pengeluaran</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="h-11 sm:h-10 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenWhatsApp}
            className="h-11 sm:h-10 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim WA Atasan</span>
          </button>
        </div>
      </div>

      {/* Filter Period Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
            <button
              onClick={() => handlePeriodChange('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                periodType === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => handlePeriodChange('weekly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                periodType === 'weekly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handlePeriodChange('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                periodType === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handlePeriodChange('custom')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                periodType === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Rentang Tanggal
            </button>
          </div>

          <div className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
            Periode: {report?.period_label || 'Semua Data'}
          </div>
        </div>

        {periodType === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-300 p-1.5 bg-white text-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-300 p-1.5 bg-white text-xs"
              />
            </div>
            <button
              onClick={loadReport}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700"
            >
              Terapkan Filter
            </button>
          </div>
        )}
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Omzet */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Pemasukan</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {formatRupiah(report?.total_income ?? 0)}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {report?.transaction_count ?? 0} transaksi berhasil
          </div>
        </div>

        {/* Laba Kotor */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Laba Kotor</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatRupiah(report?.gross_profit ?? 0)}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Setelah dikurangi modal barang terjual
          </div>
        </div>

        {/* Biaya Operasional */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Biaya Operasional</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatRupiah(report?.operational_expenses ?? 0)}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Gaji, listrik, sewa, alat, dsb.
          </div>
        </div>

        {/* Estimasi Laba Bersih */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Estimasi Laba Bersih</span>
          <div className="text-xl font-black text-teal-700 mt-1">
            {formatRupiah(report?.net_profit ?? 0)}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Laba kotor dikurangi biaya operasional
          </div>
        </div>
      </div>

      {/* Detailed Breakdown: Revenue breakdown & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <span>Rincian Sumber Pemasukan</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-700">Penjualan Suku Cadang & Oli</span>
              </div>
              <span className="font-bold text-slate-900">{formatRupiah(report?.parts_sales ?? 0)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-slate-700">Pendapatan Jasa Servis</span>
              </div>
              <span className="font-bold text-slate-900">{formatRupiah(report?.service_revenue ?? 0)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <span className="font-semibold text-amber-900">Harga Pokok Penjualan (HPP)</span>
              <span className="font-bold text-amber-900">-{formatRupiah(report?.cogs_total ?? 0)}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
              <span>Laba Kotor Bengkel:</span>
              <span className="text-emerald-700">{formatRupiah(report?.gross_profit ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                <span>Pengeluaran pada Periode Ini ({report?.expenses?.length ?? 0})</span>
              </h3>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                + Tambah
              </button>
            </div>

            <div className="mt-3 max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              {(!report?.expenses || report.expenses.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada pengeluaran yang dicatat pada rentang tanggal ini.
                </div>
              ) : (
                report.expenses.map(exp => (
                  <div key={exp.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-800 truncate">{exp.description}</div>
                      <div className="text-[10px] text-slate-500">
                        {formatDate(exp.date)} • <span className="font-mono text-slate-400">[{exp.category}]</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-rose-700">{formatRupiah(exp.amount)}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="rounded-sm p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-800">
            <span>Total Pengeluaran Tercatat:</span>
            <span className="text-rose-700">{formatRupiah(report?.total_expenses ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Table for the Period */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          <span>Rincian Nota Transaksi Periode Terpilih</span>
        </h3>

        <div className="overflow-x-auto">
          {(!report?.transactions || report.transactions.length === 0) ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada transaksi pada periode yang dipilih.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-[11px] uppercase text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">No. Nota</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Pelanggan / Kendaraan</th>
                  <th className="py-2.5 px-3 text-right">Barang</th>
                  <th className="py-2.5 px-3 text-right">Jasa</th>
                  <th className="py-2.5 px-3 text-right">Diskon</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.transactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{trx.invoice_no}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{formatDateTime(trx.date)}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{trx.customer_name || 'Umum'}</div>
                      {trx.vehicle_info && <div className="text-[10px] text-slate-500 font-mono">{trx.vehicle_info}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{formatRupiah(trx.items_subtotal)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{formatRupiah(trx.services_subtotal)}</td>
                    <td className="py-2.5 px-3 text-right text-teal-700">{trx.discount > 0 ? `-${formatRupiah(trx.discount)}` : '-'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatRupiah(trx.total_amount)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onViewReceipt(trx)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Nota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: CATAT PENGELUARAN */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Catat Pengeluaran Bengkel</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {expenseError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                {expenseError}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Biaya</label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  >
                    <option value="OPERASIONAL">Operasional Umum</option>
                    <option value="LISTRIK_AIR">Listrik, Air & Internet</option>
                    <option value="GAJI_KARYAWAN">Gaji / Upah Mekanik</option>
                    <option value="SEWA_TEMPAT">Sewa Tempat</option>
                    <option value="ALAT_BENGKEL">Alat Kerja & Kunci</option>
                    <option value="PEMBELIAN_STOK">Pembelian Persediaan</option>
                    <option value="LAINNYA">Lain-lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan Biaya *</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  placeholder="Contoh: Beli bensin kompresor, bayar token listrik..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expenseAmount || ''}
                  onChange={e => setExpenseAmount(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Nota / Bukti Kas (Opsional)</label>
                <input
                  type="text"
                  value={expenseReceipt}
                  onChange={e => setExpenseReceipt(e.target.value)}
                  placeholder="Contoh: KWT-091"
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="rounded-xl bg-teal-600 px-4 py-2 font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {expenseSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
