import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileSpreadsheet,
  Settings,
  Bell,
  Menu,
  X,
  ExternalLink,
  Wrench,
  Check,
  Coffee,
  Ban,
} from 'lucide-react';
import { api } from './utils/api.js';
import type { WorkshopProfile, Transaction, Item } from './types/bengkel.js';
import { DashboardView } from './views/DashboardView.js';
import { InventoryView } from './views/InventoryView.js';
import { CashierView } from './views/CashierView.js';
import { FinancialReportsView } from './views/FinancialReportsView.js';
import { SettingsView } from './views/SettingsView.js';
import { ReceiptModal } from './components/ReceiptModal.js';
import { WhatsAppReportModal } from './components/WhatsAppReportModal.js';
import { CreatorCoffeeModal } from './components/CreatorCoffeeModal.js';
import { EditReceiptModal } from './components/EditReceiptModal.js';
import { PWAInstallButton } from './components/PWAInstallButton.js';
import { OfflineIndicator } from './components/OfflineIndicator.js';
import { requestNotificationPermission, sendLocalNotification } from './utils/notifications.js';

type Tab = 'dashboard' | 'inventory' | 'cashier' | 'reports' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Transaction | null>(null);
  const [cancelReceiptTarget, setCancelReceiptTarget] = useState<Transaction | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancellingReceipt, setCancellingReceipt] = useState(false);

  // Workshop Profile
  const [profile, setProfile] = useState<WorkshopProfile>({
    name: '',
    tagline: '',
    address: '',
    phone: '',
    boss_whatsapp: '',
    receipt_footer: 'Terima kasih atas kunjungan Anda!',
    updated_at: new Date().toISOString(),
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Modals
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [restockItemTarget, setRestockItemTarget] = useState<Item | null>(null);

  // Push notifications permission state
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.getProfile();
      setProfile(res.profile);
    } catch (err) {
      console.error('Gagal memuat profil bengkel:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      sendLocalNotification('Notifikasi BengkelPro Aktif', {
        body: 'Anda akan menerima pemberitahuan otomatis saat stok menipis dan transaksi selesai.',
      });
    }
  };

  const handleConfirmCancelReceipt = async () => {
    if (!cancelReceiptTarget || !cancelReasonInput.trim()) return;
    try {
      setCancellingReceipt(true);
      await api.cancelTransaction(cancelReceiptTarget.id, cancelReasonInput.trim());
      setCancelReceiptTarget(null);
      setCancelReasonInput('');
      setActiveReceipt(null);
      alert('Nota transaksi berhasil dibatalkan dan stok telah disinkronkan kembali.');
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan nota transaksi');
    } finally {
      setCancellingReceipt(false);
    }
  };

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as Tab, label: 'Stok Barang', icon: Package },
    { id: 'cashier' as Tab, label: 'Transaksi / Kasir', icon: ShoppingCart },
    { id: 'reports' as Tab, label: 'Laporan Keuangan', icon: FileSpreadsheet },
    { id: 'settings' as Tab, label: 'Pengaturan Bengkel', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100/70 font-sans text-slate-800">
      {/* Offline Status Alert */}
      <OfflineIndicator />

      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-white z-40 border-r border-slate-800">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt="Logo"
              className="h-10 w-10 object-contain rounded-xl bg-white p-1"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-black text-sm text-white tracking-tight truncate">
              {profile.name || 'BengkelPro'}
            </h1>
            <p className="text-[11px] text-teal-400 font-medium truncate">
              {profile.tagline || 'Sistem Bengkel Online'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">PWA Install</span>
            <PWAInstallButton />
          </div>

          {!notificationsEnabled && (
            <button
              onClick={handleEnableNotifications}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700/80 transition"
            >
              <Bell className="w-3.5 h-3.5 text-teal-400" />
              <span>Aktifkan Notifikasi</span>
            </button>
          )}

          <div className="pt-2 text-[10px] text-slate-500 text-center">
            Penyimpanan Online Server Terhubung
          </div>
        </div>
      </aside>

      {/* MOBILE TOP NAVBAR */}
      <header className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          {profile.logo_url ? (
            <img src={profile.logo_url} alt="Logo" className="h-8 w-8 object-contain rounded-lg bg-white p-0.5" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white">
              <Wrench className="w-4 h-4" />
            </div>
          )}
          <div className="truncate">
            <h1 className="font-bold text-xs text-white truncate">{profile.name || 'BengkelPro'}</h1>
            <p className="text-[10px] text-teal-400 truncate">Online Database</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCoffeeModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 active:scale-95 transition shadow-xs"
            title="Bagi Kopi Pembuat (Jamhur FB Kujang Luhur sekawan)"
          >
            <Coffee className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-bold">Bagi Kopi</span>
          </button>
          <PWAInstallButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-slate-900 text-white rounded-t-2xl p-5 space-y-2 border-t border-slate-800 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">Pilih Menu Bengkel</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top desktop header bar */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-slate-200/80 px-8 py-3.5 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">{profile.name || 'Bengkel Motor & Mobil'}</span>
            <span>&bull;</span>
            <span className="capitalize font-medium text-teal-700">
              {navItems.find(n => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCoffeeModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3.5 py-1.5 text-xs font-bold hover:from-amber-600 hover:to-amber-700 transition shadow-xs active:scale-95"
              title="Bagi Kopi Pembuat (Jamhur FB Kujang Luhur sekawan)"
            >
              <Coffee className="w-4 h-4 text-white" />
              <span>Bagi Kopi</span>
            </button>
            <PWAInstallButton />
            {!notificationsEnabled && (
              <button
                onClick={handleEnableNotifications}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                title="Aktifkan notifikasi peramban"
              >
                <Bell className="w-3.5 h-3.5 text-teal-600" />
                <span>Notifikasi</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">Database Online Aktif</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              onNavigate={(tab) => setActiveTab(tab)}
              onViewReceipt={(trx) => setActiveReceipt(trx)}
              onRestockItem={(item) => {
                setRestockItemTarget(item);
                setActiveTab('inventory');
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              initialRestockItem={restockItemTarget}
              onClearRestockItem={() => setRestockItemTarget(null)}
            />
          )}

          {activeTab === 'cashier' && (
            <CashierView
              onPrintReceipt={(trx) => setActiveReceipt(trx)}
            />
          )}

          {activeTab === 'reports' && (
            <FinancialReportsView
              profile={profile}
              onOpenWhatsApp={() => setShowWhatsAppModal(true)}
              onViewReceipt={(trx) => setActiveReceipt(trx)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              onProfileUpdated={(updated) => setProfile(updated)}
            />
          )}
        </div>

        {/* BOTTOM NAV BAR FOR MOBILE (Android Ergonomics: min 52px height) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/90 px-1 py-1 flex justify-around items-center z-40 shadow-lg min-h-[56px] backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition active:scale-95 ${
                  isActive
                    ? 'text-teal-700 font-bold bg-teal-50/60'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-teal-600 scale-110' : 'text-slate-400'}`} />
                <span className="truncate max-w-[64px] tracking-tight">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </main>

      {/* RECEIPT PRINT MODAL */}
      {activeReceipt && (
        <ReceiptModal
          transaction={activeReceipt}
          profile={profile}
          onClose={() => setActiveReceipt(null)}
          onEdit={(trx) => {
            setActiveReceipt(null);
            setEditingReceipt(trx);
          }}
          onCancel={(trx) => {
            setActiveReceipt(null);
            setCancelReceiptTarget(trx);
          }}
        />
      )}

      {/* EDIT RECEIPT MODAL */}
      {editingReceipt && (
        <EditReceiptModal
          transaction={editingReceipt}
          onClose={() => setEditingReceipt(null)}
          onSuccess={(updated: Transaction) => {
            setEditingReceipt(null);
            setActiveReceipt(updated);
          }}
        />
      )}

      {/* CANCEL RECEIPT CONFIRMATION MODAL */}
      {cancelReceiptTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Batalkan Nota Transaksi</h3>
                <p className="text-[11px] text-slate-500 font-mono">{cancelReceiptTarget.invoice_no}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Membatalkan nota akan mengembalikan seluruh stok barang ke gudang dan menandai status nota menjadi dibatalkan.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Pembatalan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                placeholder="Contoh: Pelanggan batal servis, salah input barang..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCancelReceiptTarget(null);
                  setCancelReasonInput('');
                }}
                disabled={cancellingReceipt}
                className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelReceipt}
                disabled={cancellingReceipt || !cancelReasonInput.trim()}
                className="h-10 px-4 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {cancellingReceipt ? 'Memproses...' : 'Ya, Batalkan Nota'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP REPORT MODAL */}
      {showWhatsAppModal && (
        <WhatsAppReportModal
          profile={profile}
          onClose={() => setShowWhatsAppModal(false)}
          onOpenSettings={() => {
            setShowWhatsAppModal(false);
            setActiveTab('settings');
          }}
        />
      )}

      {/* CREATOR COFFEE MODAL (Bagi Kopi Pembuat) */}
      <CreatorCoffeeModal
        isOpen={showCoffeeModal}
        onClose={() => setShowCoffeeModal(false)}
      />
    </div>
  );
}
