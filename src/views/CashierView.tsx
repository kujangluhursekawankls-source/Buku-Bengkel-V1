import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  User,
  Car,
  CreditCard,
  Printer,
  Ban,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Package,
  History,
  X,
  RefreshCw,
  Edit2,
  Share2,
} from 'lucide-react';
import { api } from '../utils/api.js';
import type { Item, ServiceItem, Transaction, PaymentMethod } from '../types/bengkel.js';
import { formatRupiah, formatDateTime } from '../utils/formatters.js';
import { EditReceiptModal } from '../components/EditReceiptModal.js';

interface CashierViewProps {
  onPrintReceipt: (transaction: Transaction) => void;
  onEditReceipt?: (transaction: Transaction) => void;
}

interface CartItem {
  item: Item;
  qty: number;
}

interface CartService {
  service_id?: string;
  name: string;
  price: number;
  qty: number;
}

export const CashierView: React.FC<CashierViewProps> = ({ onPrintReceipt }) => {
  // Inventory & Services Catalog
  const [items, setItems] = useState<Item[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [searchItem, setSearchItem] = useState('');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'items' | 'services'>('items');

  // Active Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartServices, setCartServices] = useState<CartService[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [amountReceived, setAmountReceived] = useState<number>(0);

  // Service Management State (Add & Edit & Delete)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(0);
  const [newServiceCategory, setNewServiceCategory] = useState('Servis & Perawatan');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const [editServiceTarget, setEditServiceTarget] = useState<ServiceItem | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editServicePrice, setEditServicePrice] = useState<number>(0);
  const [editServiceCategory, setEditServiceCategory] = useState('');
  const [editServiceDesc, setEditServiceDesc] = useState('');

  const [deleteServiceTarget, setDeleteServiceTarget] = useState<ServiceItem | null>(null);
  const [deletingService, setDeletingService] = useState(false);

  // Transaction submission & result
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<Transaction | null>(null);

  // History & Cancellation
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [cancelModalTrx, setCancelModalTrx] = useState<Transaction | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadCatalogs = async () => {
    try {
      setLoadingCatalog(true);
      const [itemsData, servicesData] = await Promise.all([
        api.getItems(),
        api.getServices(),
      ]);
      setItems(itemsData);
      setServices(servicesData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.getTransactions(50);
      setTransactions(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  // Cart operations
  const handleAddItemToCart = (item: Item) => {
    if (item.stock <= 0) {
      alert(`Stok untuk ${item.name} saat ini kosong.`);
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        if (existing.qty >= item.stock) {
          alert(`Jumlah melebihi stok yang tersedia (${item.stock} ${item.unit}).`);
          return prev;
        }
        return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const handleUpdateItemQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItemFromCart(itemId);
      return;
    }
    const target = items.find(i => i.id === itemId);
    if (target && newQty > target.stock) {
      alert(`Jumlah melebihi stok yang tersedia (${target.stock} ${target.unit}).`);
      return;
    }
    setCartItems(prev => prev.map(i => i.item.id === itemId ? { ...i, qty: newQty } : i));
  };

  const handleRemoveItemFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.item.id !== itemId));
  };

  const handleAddServiceToCart = (service: ServiceItem) => {
    setCartServices(prev => {
      const existing = prev.find(s => s.service_id === service.id);
      if (existing) {
        return prev.map(s => s.service_id === service.id ? { ...s, qty: s.qty + 1 } : s);
      }
      return [...prev, { service_id: service.id, name: service.name, price: service.price, qty: 1 }];
    });
  };

  const handleUpdateServiceQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCartServices(prev => prev.filter((_, i) => i !== index));
      return;
    }
    setCartServices(prev => prev.map((s, i) => i === index ? { ...s, qty: newQty } : s));
  };

  const handleRemoveServiceFromCart = (index: number) => {
    setCartServices(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const itemsSubtotal = cartItems.reduce((sum, i) => sum + i.item.sell_price * i.qty, 0);
  const servicesSubtotal = cartServices.reduce((sum, s) => sum + s.price * s.qty, 0);
  const grossSubtotal = itemsSubtotal + servicesSubtotal;
  const netDiscount = Math.max(0, Math.min(grossSubtotal, discount));
  const totalAmount = Math.max(0, grossSubtotal - netDiscount);
  const changeAmount = paymentMethod === 'TUNAI' ? Math.max(0, (amountReceived || 0) - totalAmount) : 0;

  // Auto preset exact amount for convenience
  const handleQuickCash = (amount: number) => {
    setAmountReceived(amount);
  };

  // Clear Cart
  const handleResetCart = () => {
    setCartItems([]);
    setCartServices([]);
    setCustomerName('');
    setCustomerPhone('');
    setVehicleInfo('');
    setNotes('');
    setDiscount(0);
    setAmountReceived(0);
    setSubmitError(null);
  };

  // Submit checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0 && cartServices.length === 0) {
      setSubmitError('Keranjang kasir masih kosong. Pilih barang atau jasa servis terlebih dahulu.');
      return;
    }

    if (paymentMethod === 'TUNAI' && (amountReceived < totalAmount)) {
      setSubmitError(`Uang tunai yang diterima (Rp ${amountReceived.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${totalAmount.toLocaleString('id-ID')}).`);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        items: cartItems.map(i => ({ item_id: i.item.id, qty: i.qty })),
        services: cartServices.map(s => ({
          service_id: s.service_id,
          name: s.name,
          price: s.price,
          qty: s.qty,
        })),
        customer_name: customerName,
        customer_phone: customerPhone,
        vehicle_info: vehicleInfo,
        discount: netDiscount,
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'TUNAI' ? amountReceived : totalAmount,
        notes,
      };

      const result = await api.createTransaction(payload);
      setLastSavedTransaction(result);
      handleResetCart();
      // Reload inventory stock to reflect new levels
      loadCatalogs();
    } catch (err: any) {
      setSubmitError(err.message || 'Penyimpanan transaksi ke server gagal. Periksa koneksi internet Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  // Create new service item
  const handleCreateNewService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    try {
      const created = await api.createService({
        name: newServiceName.trim(),
        price: newServicePrice,
        category: newServiceCategory.trim() || 'Servis & Perawatan',
        description: newServiceDesc.trim() || undefined,
      });
      setServices(prev => [...prev, created]);
      handleAddServiceToCart(created);
      setNewServiceName('');
      setNewServicePrice(0);
      setNewServiceDesc('');
      setShowAddServiceModal(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan jasa servis');
    }
  };

  // Open Edit Service Modal
  const handleOpenEditService = (service: ServiceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditServiceTarget(service);
    setEditServiceName(service.name);
    setEditServicePrice(service.price);
    setEditServiceCategory(service.category || 'Servis & Perawatan');
    setEditServiceDesc(service.description || '');
  };

  // Submit Edit Service
  const handleSubmitEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editServiceTarget) return;
    if (!editServiceName.trim()) {
      alert('Nama jasa tidak boleh kosong');
      return;
    }

    try {
      const updated = await api.updateService(editServiceTarget.id, {
        name: editServiceName.trim(),
        price: editServicePrice,
        category: editServiceCategory.trim() || 'Servis & Perawatan',
        description: editServiceDesc.trim() || undefined,
      });

      setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
      setEditServiceTarget(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui jasa servis');
    }
  };

  // Open Delete Service confirmation
  const handleOpenDeleteService = (service: ServiceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteServiceTarget(service);
  };

  // Submit Delete/Archive Service
  const handleConfirmDeleteService = async () => {
    if (!deleteServiceTarget) return;
    try {
      setDeletingService(true);
      const res = await api.deleteService(deleteServiceTarget.id);
      if (res.archived) {
        // Soft-archived
        setServices(prev => prev.filter(s => s.id !== deleteServiceTarget.id));
        alert(res.message);
      } else {
        setServices(prev => prev.filter(s => s.id !== deleteServiceTarget.id));
        alert('Jasa servis berhasil dihapus.');
      }
      setDeleteServiceTarget(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus jasa servis');
    } finally {
      setDeletingService(false);
    }
  };

  // Cancel transaction
  const handleConfirmCancel = async () => {
    if (!cancelModalTrx || !cancelReason.trim()) {
      alert('Alasan pembatalan wajib diisi.');
      return;
    }

    try {
      setCancelling(true);
      await api.cancelTransaction(cancelModalTrx.id, cancelReason);
      setCancelModalTrx(null);
      setCancelReason('');
      loadTransactions();
      loadCatalogs();
      alert('Transaksi berhasil dibatalkan dan stok telah dikembalikan ke sistem.');
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan transaksi');
    } finally {
      setCancelling(false);
    }
  };

  // Filter items in catalog search
  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchItem.toLowerCase()) ||
    i.code.toLowerCase().includes(searchItem.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kasir & Transaksi Bengkel</h2>
          <p className="text-xs text-slate-500">
            Pencatatan nota suku cadang dan jasa servis dengan pemotongan stok otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadTransactions();
              setShowHistoryModal(true);
            }}
            className="h-11 sm:h-10 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-95 transition"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Riwayat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Main Cashier Workspace: Catalog on Left, Active Cart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (Catalog) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 sm:space-y-4">
          {/* Catalog Tab & Search */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('items')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 font-semibold transition ${
                    activeCatalogTab === 'items'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Suku Cadang ({items.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('services')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 font-semibold transition ${
                    activeCatalogTab === 'services'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Jasa Servis ({services.length})</span>
                </button>
              </div>

              {activeCatalogTab === 'services' && (
                <button
                  onClick={() => setShowAddServiceModal(true)}
                  className="h-9 px-3 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 hover:bg-teal-100 active:scale-95 transition whitespace-nowrap shrink-0"
                >
                  + Jasa Baru
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeCatalogTab === 'items' ? "Ketik nama atau kode barang..." : "Ketik nama jasa servis..."}
                value={searchItem}
                onChange={e => setSearchItem(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs flex-1 min-h-[300px] max-h-[520px] overflow-y-auto">
            {loadingCatalog ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <RefreshCw className="mx-auto w-5 h-5 animate-spin mb-2 text-teal-600" />
                <span>Memuat katalog...</span>
              </div>
            ) : activeCatalogTab === 'items' ? (
              filteredItems.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  {items.length === 0 ? 'Belum ada barang di database. Tambahkan barang di menu Stok terlebih dahulu.' : 'Barang tidak ditemukan.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredItems.map(item => {
                    const isOutOfStock = item.stock <= 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => !isOutOfStock && handleAddItemToCart(item)}
                        className={`rounded-xl border p-3 text-xs transition flex flex-col justify-between ${
                          isOutOfStock
                            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                            : 'border-slate-200/80 bg-white hover:border-teal-400 hover:shadow-xs cursor-pointer active:scale-98'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-slate-900 leading-tight line-clamp-1">{item.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">[{item.code}]</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="font-extrabold text-teal-700">{formatRupiah(item.sell_price)}</span>
                          <span className={`text-[10px] font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-slate-600'}`}>
                            {isOutOfStock ? 'Habis' : `Stok: ${item.stock} ${item.unit}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* SERVICES GRID (Dengan Tombol Edit & Hapus Jasa Sesuai Revisi 5) */
              services.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <p>Belum ada daftar jasa servis.</p>
                  <button
                    onClick={() => setShowAddServiceModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 h-10"
                  >
                    + Buat Jasa Baru
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {services
                    .filter(s => s.name.toLowerCase().includes(searchItem.toLowerCase()))
                    .map(srv => (
                      <div
                        key={srv.id}
                        className="rounded-xl border border-slate-200/80 bg-white p-3 text-xs hover:border-teal-400 hover:shadow-xs transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 leading-tight line-clamp-1">{srv.name}</span>
                            {/* Tombol Aksi Edit & Hapus Jasa */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditService(srv, e)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                                title="Edit Jasa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleOpenDeleteService(srv, e)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Hapus / Nonaktifkan Jasa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {srv.category || 'Servis'}
                            {srv.description && ` • ${srv.description}`}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="font-extrabold text-teal-700">{formatRupiah(srv.price)}</span>
                          <button
                            type="button"
                            onClick={() => handleAddServiceToCart(srv)}
                            className="h-8 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold active:scale-95 transition"
                          >
                            + Pilih
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Column (Cart & Checkout) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <ShoppingCart className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Rincian Transaksi Kasir</h3>
              </div>
              {(cartItems.length > 0 || cartServices.length > 0) && (
                <button
                  onClick={handleResetCart}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 p-1"
                >
                  Bersihkan
                </button>
              )}
            </div>

            {/* Customer & Vehicle Info Form (Optional, Mobile-friendly) */}
            <div className="mt-3 space-y-2 p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                    <User className="w-3 h-3" /> Pelanggan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Nama pelanggan..."
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                    <Car className="w-3 h-3" /> Kendaraan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo}
                    onChange={e => setVehicleInfo(e.target.value)}
                    placeholder="Vario B 1234 XYZ..."
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="mt-3 max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
              {cartItems.length === 0 && cartServices.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Keranjang kosong. Pilih barang atau jasa di sebelah kiri.
                </div>
              ) : (
                <>
                  {/* Inventory Items */}
                  {cartItems.map(item => (
                    <div key={item.item.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 truncate">{item.item.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {formatRupiah(item.item.sell_price)} / {item.item.unit}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(item.item.id, item.qty - 1)}
                          className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold w-6 text-center text-xs">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(item.item.id, item.qty + 1)}
                          className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right w-20">
                        <div className="font-bold text-slate-900">{formatRupiah(item.item.sell_price * item.qty)}</div>
                        <button
                          onClick={() => handleRemoveItemFromCart(item.item.id)}
                          className="text-[10px] text-rose-500 hover:text-rose-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Services */}
                  {cartServices.map((srv, idx) => (
                    <div key={`srv-${idx}`} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 truncate">[JASA] {srv.name}</div>
                        <div className="text-[10px] text-slate-500">{formatRupiah(srv.price)}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateServiceQty(idx, srv.qty - 1)}
                          className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold w-6 text-center text-xs">{srv.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateServiceQty(idx, srv.qty + 1)}
                          className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right w-20">
                        <div className="font-bold text-slate-900">{formatRupiah(srv.price * srv.qty)}</div>
                        <button
                          onClick={() => handleRemoveServiceFromCart(idx)}
                          className="text-[10px] text-rose-500 hover:text-rose-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Calculations & Discounts */}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatRupiah(grossSubtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Diskon (Rp):</span>
                <input
                  type="number"
                  min="0"
                  max={grossSubtotal}
                  value={discount || ''}
                  onChange={e => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-28 text-right h-9 rounded-lg border border-slate-200 px-2 text-xs"
                />
              </div>

              <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-slate-200 text-slate-900">
                <span>TOTAL AKHIR:</span>
                <span className="text-teal-700 text-base">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method & Cash Received */}
            <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Metode Pembayaran:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['TUNAI', 'TRANSFER', 'QRIS'] as PaymentMethod[]).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`h-10 rounded-xl text-xs font-bold border transition ${
                        paymentMethod === pm
                          ? 'border-teal-600 bg-teal-50 text-teal-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'TUNAI' && (
                <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-slate-700">Uang Diterima:</label>
                    <input
                      type="number"
                      min="0"
                      value={amountReceived || ''}
                      onChange={e => setAmountReceived(Number(e.target.value))}
                      placeholder={totalAmount.toString()}
                      className="w-32 text-right h-10 rounded-lg border border-slate-300 px-2 text-sm font-bold"
                    />
                  </div>

                  {/* Quick cash buttons (min touch target) */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickCash(totalAmount)}
                      className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold hover:bg-slate-100 active:scale-95 transition"
                    >
                      Uang Pas
                    </button>
                    {[50000, 100000, 200000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickCash(val)}
                        className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold hover:bg-slate-100 active:scale-95 transition"
                      >
                        {formatRupiah(val)}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60 font-bold">
                    <span className="text-slate-600">Kembalian:</span>
                    <span className="text-emerald-700 text-sm">{formatRupiah(changeAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            {submitError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}
          </div>

          {/* Checkout Submit Button (Android-friendly min 48px touch height) */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleCheckout}
              disabled={submitting || (cartItems.length === 0 && cartServices.length === 0)}
              className="w-full h-12 rounded-xl bg-teal-600 text-xs font-bold text-white shadow-md hover:bg-teal-700 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Server...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesaikan Transaksi ({formatRupiah(totalAmount)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner when Transaction Saved */}
      {lastSavedTransaction && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-teal-950 text-sm">
                Transaksi Berhasil Disimpan ({lastSavedTransaction.invoice_no})
              </h4>
              <p className="text-xs text-teal-700">
                Stok terpotong di database server. Total: {formatRupiah(lastSavedTransaction.total_amount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onPrintReceipt(lastSavedTransaction)}
              className="flex-1 sm:flex-none h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={() => onPrintReceipt(lastSavedTransaction)}
              className="flex-1 sm:flex-none h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim WA</span>
            </button>
            <button
              onClick={() => setLastSavedTransaction(null)}
              className="h-11 sm:h-10 px-3 rounded-xl border border-teal-300 bg-white text-xs font-semibold text-teal-900 hover:bg-teal-100"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH JASA SERVIS BARU */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Jasa Servis Baru</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNewService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Jasa Servis *</label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  placeholder="Contoh: Tune Up Injeksi / Ganti Oli"
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Jasa</label>
                <input
                  type="text"
                  value={newServiceCategory}
                  onChange={e => setNewServiceCategory(e.target.value)}
                  placeholder="Contoh: Servis Mesin / Kelistrikan"
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tarif Jasa (Rp) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newServicePrice || ''}
                  onChange={e => setNewServicePrice(Number(e.target.value))}
                  placeholder="35000"
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm font-bold focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={newServiceDesc}
                  onChange={e => setNewServiceDesc(e.target.value)}
                  placeholder="Garansi 7 hari, dsb."
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-teal-600 text-xs font-bold text-white hover:bg-teal-700"
                >
                  Simpan & Pilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT JASA SERVIS (Fitur Baru Revisi 5) */}
      {editServiceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Ubah Data Jasa Servis</h3>
              <button onClick={() => setEditServiceTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEditService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Jasa *</label>
                <input
                  type="text"
                  required
                  value={editServiceName}
                  onChange={e => setEditServiceName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                <input
                  type="text"
                  value={editServiceCategory}
                  onChange={e => setEditServiceCategory(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tarif Jasa (Rp) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editServicePrice}
                  onChange={e => setEditServicePrice(Number(e.target.value))}
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm font-bold focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={editServiceDesc}
                  onChange={e => setEditServiceDesc(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Perubahan tarif hanya berlaku untuk transaksi baru dan tidak mengubah riwayat nota lama.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditServiceTarget(null)}
                  className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-teal-600 text-xs font-bold text-white hover:bg-teal-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS JASA SERVIS (Fitur Baru Revisi 5) */}
      {deleteServiceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600 pb-2 border-b border-rose-100">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-sm font-bold">Hapus Jasa Servis</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Yakin ingin menghapus jasa <strong>&quot;{deleteServiceTarget.name}&quot;</strong>?
            </p>

            <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-900 border border-amber-200">
              Jika jasa ini pernah digunakan dalam riwayat transaksi sebelumnya, sistem akan <strong>mengarsipkannya</strong> agar tidak muncul di kasir baru tanpa merusak laporan historis.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteServiceTarget(null)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteService}
                disabled={deletingService}
                className="h-11 px-5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deletingService ? 'Memproses...' : 'Ya, Hapus Jasa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RIWAYAT TRANSAKSI & PEMBATALAN */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <History className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Riwayat Transaksi & Nota Kasir</h3>
                  <p className="text-[11px] text-slate-500">Cetak ulang nota atau batalkan transaksi dengan audit pengembalian stok</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50">
              <input
                type="text"
                placeholder="Cari nomor nota, pelanggan, atau kendaraan..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              {loadingHistory ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <RefreshCw className="mx-auto w-5 h-5 animate-spin mb-2 text-teal-600" />
                  <span>Memuat riwayat transaksi...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Belum ada transaksi tersimpan di database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400 font-semibold">
                        <th className="py-2.5 px-3">No. Nota</th>
                        <th className="py-2.5 px-3">Pelanggan / Kendaraan</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions
                        .filter(t =>
                          t.invoice_no.toLowerCase().includes(historySearch.toLowerCase()) ||
                          (t.customer_name && t.customer_name.toLowerCase().includes(historySearch.toLowerCase())) ||
                          (t.vehicle_info && t.vehicle_info.toLowerCase().includes(historySearch.toLowerCase()))
                        )
                        .map(trx => {
                          const isCancelled = trx.status === 'CANCELLED';
                          return (
                            <tr key={trx.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                                <div>{trx.invoice_no}</div>
                                <div className="text-[10px] text-slate-400 font-normal">{formatDateTime(trx.date)}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-medium text-slate-800">{trx.customer_name || 'Umum'}</div>
                                {trx.vehicle_info && <div className="text-[10px] text-slate-500">{trx.vehicle_info}</div>}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                                {formatRupiah(trx.total_amount)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isCancelled ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {isCancelled ? 'Dibatalkan' : 'Selesai'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => onPrintReceipt(trx)}
                                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
                                    title="Buka Nota"
                                  >
                                    Nota
                                  </button>
                                  {!isCancelled && (
                                    <>
                                      <button
                                        onClick={() => setEditingTransaction(trx)}
                                        className="h-8 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 active:scale-95 transition"
                                        title="Edit nota transaksi"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => setCancelModalTrx(trx)}
                                        className="h-8 px-2.5 rounded-lg border border-rose-200 bg-white text-[11px] font-semibold text-rose-700 hover:bg-rose-50 active:scale-95 transition"
                                        title="Batalkan transaksi ini dan kembalikan stok"
                                      >
                                        Batal
                                      </button>
                                    </>
                                  )}
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

            <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="h-10 px-5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI PEMBATALAN TRANSAKSI */}
      {cancelModalTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600 pb-2 border-b border-rose-100">
              <Ban className="w-5 h-5" />
              <h3 className="text-base font-bold">Batalkan Transaksi: {cancelModalTrx.invoice_no}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Mekanisme pembatalan akan <strong>mengembalikan seluruh stok barang</strong> ke persediaan secara atomik dan mencatat riwayat pergerakan stok sebagai pembatalan.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Pembatalan (Wajib Diisi):</label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Contoh: Pelanggan salah pilih barang, salah input kuantitas kasir..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalTrx(null)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling || !cancelReason.trim()}
                className="h-11 px-5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelling ? 'Memproses...' : 'Konfirmasi Batalkan Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT NOTA TRANSAKSI TERSIMPAN */}
      {editingTransaction && (
        <EditReceiptModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaved={(updated) => {
            setEditingTransaction(null);
            loadTransactions();
            loadCatalogs();
            // Automatically update and preview updated receipt
            onPrintReceipt(updated);
            alert(`Nota ${updated.invoice_no} berhasil diperbarui dan stok telah disinkronkan.`);
          }}
        />
      )}
    </div>
  );
};
