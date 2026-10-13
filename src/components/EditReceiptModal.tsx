import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  AlertCircle,
  Save,
  ShoppingCart,
  Wrench,
  Search,
} from 'lucide-react';
import { api } from '../utils/api.js';
import type { Transaction, Item, ServiceItem } from '../types/bengkel.js';
import { formatRupiah } from '../utils/formatters.js';

interface EditReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSaved: (updatedTrx: Transaction) => void;
}

interface EditCartItem {
  item_id: string;
  item_code: string;
  item_name: string;
  unit: string;
  sell_price: number;
  qty: number;
}

interface EditCartService {
  service_id?: string;
  name: string;
  price: number;
  qty: number;
}

export const EditReceiptModal: React.FC<EditReceiptModalProps> = ({
  transaction,
  onClose,
  onSaved,
}) => {
  const [customerName, setCustomerName] = useState(transaction.customer_name || '');
  const [customerPhone, setCustomerPhone] = useState(transaction.customer_phone || '');
  const [vehicleInfo, setVehicleInfo] = useState(transaction.vehicle_info || '');
  const [notes, setNotes] = useState(transaction.notes || '');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'TRANSFER' | 'QRIS'>(transaction.payment_method);
  const [discount, setDiscount] = useState<number>(transaction.discount || 0);
  const [amountReceived, setAmountReceived] = useState<number>(transaction.amount_received || transaction.total_amount);

  // Cart state
  const [items, setItems] = useState<EditCartItem[]>(
    transaction.items.map(i => ({
      item_id: i.item_id,
      item_code: i.item_code,
      item_name: i.item_name,
      unit: i.unit,
      sell_price: i.sell_price,
      qty: i.qty,
    }))
  );

  const [services, setServices] = useState<EditCartService[]>(
    transaction.services.map(s => ({
      service_id: s.service_id,
      name: s.name,
      price: s.price,
      qty: s.qty,
    }))
  );

  // Available catalog
  const [catalogItems, setCatalogItems] = useState<Item[]>([]);
  const [catalogServices, setCatalogServices] = useState<ServiceItem[]>([]);
  const [searchCatalog, setSearchCatalog] = useState('');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'items' | 'services'>('items');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      const [invRes, srvRes] = await Promise.all([
        api.getItems(),
        api.getServices(),
      ]);
      setCatalogItems(invRes.items || []);
      setCatalogServices((srvRes.services || []).filter(s => s.is_active !== false));
    } catch (err: any) {
      console.error('Gagal memuat katalog:', err);
    }
  };

  // Computations
  const itemsSubtotal = items.reduce((acc, curr) => acc + curr.sell_price * curr.qty, 0);
  const servicesSubtotal = services.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const grossSubtotal = itemsSubtotal + servicesSubtotal;
  const safeDiscount = Math.max(0, Math.min(grossSubtotal, discount));
  const totalAmount = grossSubtotal - safeDiscount;
  const changeAmount = paymentMethod === 'TUNAI' ? Math.max(0, amountReceived - totalAmount) : 0;

  // Handlers for Items
  const handleAddItem = (item: Item) => {
    const existingIndex = items.findIndex(i => i.item_id === item.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].qty += 1;
      setItems(updated);
    } else {
      setItems(prev => [
        ...prev,
        {
          item_id: item.id,
          item_code: item.code,
          item_name: item.name,
          unit: item.unit,
          sell_price: item.sell_price,
          qty: 1,
        },
      ]);
    }
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setItems(prev => prev.filter((_, i) => i !== index));
    } else {
      const updated = [...items];
      updated[index].qty = newQty;
      setItems(updated);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handlers for Services
  const handleAddService = (srv: ServiceItem) => {
    const existingIndex = services.findIndex(s => s.service_id === srv.id || s.name === srv.name);
    if (existingIndex >= 0) {
      const updated = [...services];
      updated[existingIndex].qty += 1;
      setServices(updated);
    } else {
      setServices(prev => [
        ...prev,
        {
          service_id: srv.id,
          name: srv.name,
          price: srv.price,
          qty: 1,
        },
      ]);
    }
  };

  const handleUpdateServiceQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setServices(prev => prev.filter((_, i) => i !== index));
    } else {
      const updated = [...services];
      updated[index].qty = newQty;
      setServices(updated);
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 && services.length === 0) {
      setError('Nota harus memiliki minimal 1 suku cadang atau jasa servis');
      return;
    }

    if (paymentMethod === 'TUNAI' && amountReceived < totalAmount) {
      setError(`Uang tunai diterima (${formatRupiah(amountReceived)}) kurang dari total nota (${formatRupiah(totalAmount)})`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        vehicle_info: vehicleInfo,
        notes,
        items: items.map(i => ({
          item_id: i.item_id,
          qty: i.qty,
          sell_price: i.sell_price,
        })),
        services: services.map(s => ({
          service_id: s.service_id,
          name: s.name,
          price: s.price,
          qty: s.qty,
        })),
        discount: safeDiscount,
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'TUNAI' ? amountReceived : totalAmount,
      };

      const updated = await api.updateTransaction(transaction.id, payload);
      onSaved(updated);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan nota');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Edit Nota Transaksi</span>
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                {transaction.invoice_no}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sesuaikan item, jumlah, jasa, atau data pelanggan. Stok & laporan akan disinkronkan otomatis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nama Pelanggan</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Pelanggan Umum"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">No. WhatsApp / HP</label>
              <input
                type="text"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="0812..."
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Info Kendaraan / Plat</label>
              <input
                type="text"
                value={vehicleInfo}
                onChange={e => setVehicleInfo(e.target.value)}
                placeholder="Vario B 1234 CD"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Current Items & Services in Receipt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Rincian Barang & Jasa pada Nota
              </h4>
              <span className="text-[11px] text-slate-500">
                {items.length} Barang &bull; {services.length} Jasa
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-1.5">
              {items.map((it, idx) => (
                <div
                  key={`item-${idx}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">{it.item_name}</div>
                    <div className="text-[11px] text-slate-500">
                      {formatRupiah(it.sell_price)} / {it.unit}
                    </div>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(idx, it.qty - 1)}
                      className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold w-7 text-center">{it.qty}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(idx, it.qty + 1)}
                      className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                    <div className="font-bold text-slate-900 min-w-[70px] text-right">
                      {formatRupiah(it.sell_price * it.qty)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Services List */}
              {services.map((srv, idx) => (
                <div
                  key={`srv-${idx}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-teal-200/80 bg-teal-50/40 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-teal-950 truncate flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{srv.name}</span>
                    </div>
                    <div className="text-[11px] text-teal-700 font-medium">
                      {formatRupiah(srv.price)} (Jasa)
                    </div>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateServiceQty(idx, srv.qty - 1)}
                      className="h-8 w-8 rounded-lg bg-white border border-teal-200 text-slate-700 hover:bg-teal-50 font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold w-7 text-center text-teal-950">{srv.qty}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateServiceQty(idx, srv.qty + 1)}
                      className="h-8 w-8 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                    <div className="font-bold text-teal-950 min-w-[70px] text-right">
                      {formatRupiah(srv.price * srv.qty)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {items.length === 0 && services.length === 0 && (
                <div className="p-4 text-center text-xs text-rose-500 bg-rose-50 rounded-xl border border-rose-200">
                  Semua barang dan jasa telah dihapus. Tambahkan barang/jasa di bawah ini.
                </div>
              )}
            </div>
          </div>

          {/* Add Item / Service Selector */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Tambah Barang / Jasa ke Nota:</span>
              <div className="flex rounded-lg bg-slate-200/80 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('items')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    activeCatalogTab === 'items' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Suku Cadang
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('services')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    activeCatalogTab === 'services' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Jasa Servis
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeCatalogTab === 'items' ? 'Cari suku cadang...' : 'Cari jenis jasa...'}
                value={searchCatalog}
                onChange={e => setSearchCatalog(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Quick Add Pills */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
              {activeCatalogTab === 'items' ? (
                catalogItems
                  .filter(i => i.name.toLowerCase().includes(searchCatalog.toLowerCase()) || i.code.toLowerCase().includes(searchCatalog.toLowerCase()))
                  .slice(0, 15)
                  .map(it => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => handleAddItem(it)}
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-800 hover:border-teal-400 hover:bg-teal-50 active:scale-95 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-teal-600" />
                      <span className="font-semibold">{it.name}</span>
                      <span className="text-slate-400">({formatRupiah(it.sell_price)})</span>
                    </button>
                  ))
              ) : (
                catalogServices
                  .filter(s => s.name.toLowerCase().includes(searchCatalog.toLowerCase()))
                  .slice(0, 15)
                  .map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleAddService(s)}
                      className="h-8 px-2.5 rounded-lg border border-teal-200 bg-white text-[11px] font-medium text-teal-900 hover:border-teal-400 hover:bg-teal-50 active:scale-95 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-teal-600" />
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-teal-600">({formatRupiah(s.price)})</span>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Perhitungan & Pembayaran
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Subtotal Barang</label>
                <div className="font-mono font-bold text-slate-800">{formatRupiah(itemsSubtotal)}</div>
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Subtotal Jasa</label>
                <div className="font-mono font-bold text-slate-800">{formatRupiah(servicesSubtotal)}</div>
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Diskon (Rp)</label>
                <input
                  type="number"
                  min="0"
                  max={grossSubtotal}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value) || 0)}
                  className="w-full h-8 rounded-lg border border-slate-200 px-2 text-xs font-mono font-bold focus:border-teal-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Total Akhir</label>
                <div className="font-mono font-black text-teal-700 text-sm">{formatRupiah(totalAmount)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Metode Bayar</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-teal-500 focus:outline-hidden"
                >
                  <option value="TUNAI">TUNAI (Cash)</option>
                  <option value="TRANSFER">TRANSFER BANK</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>

              {paymentMethod === 'TUNAI' && (
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Uang Diterima (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={amountReceived}
                    onChange={e => setAmountReceived(Number(e.target.value) || 0)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono font-bold focus:border-teal-500 focus:outline-hidden"
                  />
                  <div className="mt-1 text-[11px] text-slate-500">
                    Kembalian: <strong className="text-teal-700">{formatRupiah(changeAmount)}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 p-3.5 sm:p-4 bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-11 px-5 rounded-xl bg-teal-600 text-xs font-bold text-white shadow-md hover:bg-teal-700 active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
