import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Edit2,
  Filter,
  CheckCircle,
  X,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { api } from '../utils/api.js';
import type { Item, StockMovement } from '../types/bengkel.js';
import { formatRupiah, formatDateTime } from '../utils/formatters.js';

interface InventoryViewProps {
  initialRestockItem?: Item | null;
  onClearRestockItem?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  initialRestockItem,
  onClearRestockItem,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [adjustItem, setAdjustItem] = useState<Item | null>(null);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [activeMovementItem, setActiveMovementItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Sparepart',
    unit: 'Pcs',
    cost_price: 0,
    sell_price: 0,
    stock: 0,
    min_stock: 5,
  });

  // Form state for Stock Adjustment / Restock
  const [adjustData, setAdjustData] = useState({
    type: 'IN_PURCHASE' as 'IN_PURCHASE' | 'OUT_SALE' | 'ADJUSTMENT',
    quantity: 1,
    reason: '',
    reference_no: '',
    record_expense: true,
    cost_per_unit: 0,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Semua',
    'Sparepart',
    'Oli & Pelumas',
    'Ban & Velg',
    'Kelistrikan & Aki',
    'Aksesoris',
    'Baut & Mur',
    'Lainnya',
  ];

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItems(searchQuery, selectedCategory);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar stok barang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (initialRestockItem) {
      handleOpenAdjust(initialRestockItem, 'IN_PURCHASE');
      if (onClearRestockItem) onClearRestockItem();
    }
  }, [initialRestockItem]);

  // Open Add modal with auto-generated code suggestion
  const handleOpenAdd = () => {
    const nextNum = items.length + 1;
    const codeSuggest = `BRG-${String(nextNum).padStart(3, '0')}`;
    setFormData({
      code: codeSuggest,
      name: '',
      category: 'Sparepart',
      unit: 'Pcs',
      cost_price: 0,
      sell_price: 0,
      stock: 0,
      min_stock: 5,
    });
    setFormError(null);
    setShowAddModal(true);
  };

  // Open Edit modal
  const handleOpenEdit = (item: Item) => {
    setEditItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      cost_price: item.cost_price,
      sell_price: item.sell_price,
      stock: item.stock,
      min_stock: item.min_stock,
    });
    setFormError(null);
  };

  // Open Adjust modal
  const handleOpenAdjust = (item: Item, preferredType: 'IN_PURCHASE' | 'OUT_SALE' | 'ADJUSTMENT' = 'IN_PURCHASE') => {
    setAdjustItem(item);
    setAdjustData({
      type: preferredType,
      quantity: 1,
      reason: preferredType === 'IN_PURCHASE' ? 'Kulakan stok persediaan toko' : '',
      reference_no: '',
      record_expense: preferredType === 'IN_PURCHASE',
      cost_per_unit: item.cost_price,
    });
    setFormError(null);
  };

  // Submit Add
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      await api.createItem(formData);
      setShowAddModal(false);
      loadItems();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menambahkan barang');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      setSubmitting(true);
      setFormError(null);
      await api.updateItem(editItem.id, {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        cost_price: formData.cost_price,
        sell_price: formData.sell_price,
        min_stock: formData.min_stock,
      });
      setEditItem(null);
      loadItems();
    } catch (err: any) {
      setFormError(err.message || 'Gagal memperbarui barang');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Stock Adjustment / In / Out
  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    try {
      setSubmitting(true);
      setFormError(null);
      await api.adjustStock(adjustItem.id, {
        type: adjustData.type,
        quantity: adjustData.quantity,
        reason: adjustData.reason,
        reference_no: adjustData.reference_no,
        record_expense: adjustData.record_expense,
        cost_per_unit: adjustData.cost_per_unit,
      });
      setAdjustItem(null);
      loadItems();
    } catch (err: any) {
      setFormError(err.message || 'Gagal mengubah stok');
    } finally {
      setSubmitting(false);
    }
  };

  // View Stock Movements
  const handleViewMovements = async (item?: Item) => {
    try {
      setActiveMovementItem(item || null);
      setShowMovementsModal(true);
      setMovementsLoading(true);
      const data = await api.getMovements(item ? item.id : undefined);
      setMovements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setMovementsLoading(false);
    }
  };

  // Delete Item handler
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await api.deleteItem(itemToDelete.id);
      const deletedName = itemToDelete.name;
      setItemToDelete(null);
      if (editItem?.id === itemToDelete.id) {
        setEditItem(null);
      }
      await loadItems();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus barang');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Stok Barang</h2>
          <p className="text-xs text-slate-500">
            Kelola persediaan suku cadang, oli, dan barang bengkel dengan pelacakan riwayat stok akurat.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleViewMovements()}
            className="h-11 sm:h-10 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-95 transition"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Riwayat Pergerakan</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="h-11 sm:h-10 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau kode barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-hidden"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <RefreshCw className="mx-auto w-5 h-5 animate-spin mb-2 text-teal-600" />
            <span>Memuat katalog stok barang dari database...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 max-w-sm mx-auto px-4">
            <Package className="mx-auto w-10 h-10 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Belum ada barang di database</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Tambahkan barang pertama Anda untuk mulai mengelola stok dan melakukan transaksi kasir.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Barang Pertama</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Barang</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-right">Harga Modal</th>
                  <th className="py-3 px-3 text-right">Harga Jual</th>
                  <th className="py-3 px-3 text-center">Stok</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isLow = item.stock <= item.min_stock;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.code}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        {formatRupiah(item.cost_price)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatRupiah(item.sell_price)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-extrabold text-sm text-slate-900">
                          {item.stock} <span className="text-[10px] font-normal text-slate-500">{item.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {item.min_stock}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                            Habis
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenAdjust(item, 'IN_PURCHASE')}
                            className="rounded-lg bg-teal-50 border border-teal-200 px-2 py-1 text-[11px] font-semibold text-teal-800 hover:bg-teal-100 transition shadow-2xs"
                            title="Stok Masuk / Beli"
                          >
                            + Masuk
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(item, 'ADJUSTMENT')}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                            title="Penyesuaian Stok"
                          >
                            Ubah Stok
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Ubah Rincian Barang"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleViewMovements(item)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Riwayat Stok"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Hapus Barang dari Stok"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH BARANG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Tambah Barang Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitAdd} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Barang *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono uppercase focus:border-teal-500 focus:outline-hidden"
                    placeholder="CONTOH: OLI-001"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Barang Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  placeholder="Misal: Oli Shell Advance AX7 10W-40 0.8L"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Modal (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.cost_price || ''}
                    onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sell_price || ''}
                    onChange={(e) => setFormData({ ...formData, sell_price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                    placeholder="60000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                    placeholder="Pcs / Botol"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Min.</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_stock || ''}
                    onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-600 px-4 py-2 font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INFORMASI BARANG */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Ubah Rincian Barang</h3>
              <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Barang</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono uppercase focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Modal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sell_price}
                    onChange={(e) => setFormData({ ...formData, sell_price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Minimum Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Catatan: Jumlah stok fisik diubah melalui menu &apos;Ubah Stok&apos; atau &apos;Stok Masuk&apos; agar pergerakan stok tercatat ke riwayat audit.
              </p>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const target = editItem;
                    setEditItem(null);
                    setItemToDelete(target);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 font-semibold text-rose-700 hover:bg-rose-100 transition text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Barang</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-teal-600 px-4 py-2 font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Perbarui Data'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PERUBAHAN STOK / KULAKAN / PENYESUAIAN */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Perbarui Stok Barang</h3>
                <p className="text-xs text-slate-500">[{adjustItem.code}] {adjustItem.name}</p>
              </div>
              <button onClick={() => setAdjustItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitAdjust} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Stok Saat Ini:</span>
                <span className="font-extrabold text-base text-slate-900">
                  {adjustItem.stock} {adjustItem.unit}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Operasi Stok:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'IN_PURCHASE', record_expense: true })}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition ${
                      adjustData.type === 'IN_PURCHASE'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Stok Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'OUT_SALE', record_expense: false })}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition ${
                      adjustData.type === 'OUT_SALE'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    - Stok Keluar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'ADJUSTMENT', record_expense: false })}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition ${
                      adjustData.type === 'ADJUSTMENT'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Penyesuaian
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {adjustData.type === 'IN_PURCHASE' ? 'Jumlah Barang Masuk *' : adjustData.type === 'OUT_SALE' ? 'Jumlah Barang Keluar *' : 'Jumlah Penyesuaian (+ / -) *'}
                </label>
                <input
                  type="number"
                  required
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold focus:border-teal-500 focus:outline-hidden text-sm"
                  placeholder="Contoh: 10"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan / Keterangan *</label>
                <input
                  type="text"
                  required
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  placeholder="Misal: Kulakan distributor, Rusak saat display, dsb."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Faktur / Referensi (Opsional)</label>
                <input
                  type="text"
                  value={adjustData.reference_no}
                  onChange={(e) => setAdjustData({ ...adjustData, reference_no: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-hidden"
                  placeholder="Misal: PO-202610-09"
                />
              </div>

              {adjustData.type === 'IN_PURCHASE' && (
                <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-teal-900">
                    <input
                      type="checkbox"
                      checked={adjustData.record_expense}
                      onChange={(e) => setAdjustData({ ...adjustData, record_expense: e.target.checked })}
                      className="rounded-sm border-teal-300 text-teal-600"
                    />
                    <span>Catat otomatis sebagai Pembelian Persediaan (Pengeluaran)</span>
                  </label>
                  {adjustData.record_expense && (
                    <div>
                      <span className="text-[11px] text-teal-700 block mb-1">Harga Modal Beli per Unit (Rp):</span>
                      <input
                        type="number"
                        min="0"
                        value={adjustData.cost_per_unit}
                        onChange={(e) => setAdjustData({ ...adjustData, cost_per_unit: Number(e.target.value) })}
                        className="w-full rounded-lg border border-teal-200 bg-white p-2 text-xs"
                      />
                      <p className="text-[10px] text-teal-600 mt-1">
                        Total pembelian: {formatRupiah(adjustData.cost_per_unit * Math.max(0, adjustData.quantity))}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-600 px-4 py-2 font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Terapkan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RIWAYAT PERGERAKAN STOK */}
      {showMovementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <History className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeMovementItem ? `Riwayat Stok: [${activeMovementItem.code}] ${activeMovementItem.name}` : 'Semua Riwayat Pergerakan Stok'}
                  </h3>
                  <p className="text-xs text-slate-500">Audit jejak keluar-masuk barang secara transparan</p>
                </div>
              </div>
              <button onClick={() => setShowMovementsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {movementsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <RefreshCw className="mx-auto w-5 h-5 animate-spin mb-2 text-teal-600" />
                  <span>Memuat log pergerakan stok...</span>
                </div>
              ) : movements.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Belum ada catatan pergerakan stok tersimpan.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {movements.map((mov) => {
                    const isPlus = mov.change_qty > 0;
                    return (
                      <div key={mov.id} className="py-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{mov.item_name}</span>
                            <span className="font-mono text-[11px] text-slate-400">[{mov.item_code}]</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              mov.type === 'IN_PURCHASE' ? 'bg-teal-100 text-teal-800' :
                              mov.type === 'OUT_SALE' ? 'bg-blue-100 text-blue-800' :
                              mov.type === 'RETURN_CANCEL' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {mov.type === 'IN_PURCHASE' ? 'Masuk/Beli' :
                               mov.type === 'OUT_SALE' ? 'Terjual' :
                               mov.type === 'RETURN_CANCEL' ? 'Kembali Batal' : 'Penyesuaian'}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{mov.reason}</p>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {formatDateTime(mov.created_at)}
                            {mov.reference_no && ` • Ref: ${mov.reference_no}`}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`font-black text-sm ${isPlus ? 'text-teal-600' : 'text-rose-600'}`}>
                            {isPlus ? `+${mov.change_qty}` : mov.change_qty}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {mov.stock_before} &rarr; <strong>{mov.stock_after}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowMovementsModal(false)}
                className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS BARANG */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Barang dari Stok?</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus barang dari katalog</p>
              </div>
            </div>

            <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Barang:</span>
                <span className="font-mono font-bold">{itemToDelete.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Barang:</span>
                <span className="font-bold text-slate-900">{itemToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span>{itemToDelete.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sisa Stok Sekarang:</span>
                <span className="font-bold text-teal-700">{itemToDelete.stock} {itemToDelete.unit}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-5">
              Apakah Anda yakin ingin menghapus <strong>{itemToDelete.name}</strong> dari daftar stok barang?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setItemToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 shadow-sm transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Menghapus...' : 'Ya, Hapus Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
