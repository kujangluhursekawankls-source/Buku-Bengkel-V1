import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  DatabaseBackup,
  Item,
  StockMovement,
  ServiceItem,
  Transaction,
  Expense,
  WorkshopProfile,
  ActivityLog,
  DashboardStats,
  FinancialReportSummary
} from '../src/types/bengkel.js';
import { initialSeedData } from './seedData.js';

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp/data' : path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'bengkel_database.json');

interface DatabaseSchema {
  profile: WorkshopProfile;
  items: Item[];
  stock_movements: StockMovement[];
  services: ServiceItem[];
  transactions: Transaction[];
  expenses: Expense[];
  activity_logs: ActivityLog[];
}

const defaultProfile: WorkshopProfile = {
  name: '',
  tagline: '',
  address: '',
  phone: '',
  boss_whatsapp: '',
  logo_url: '',
  banner_url: '',
  stamp_config: {
    enabled: false,
    image_url: '',
    size: 85,
    position: 'signature-overlap',
    opacity: 0.85,
    offset_x: 0,
    offset_y: 0,
  },
  receipt_footer: 'Terima kasih atas kunjungan Anda!',
  supabase_url: '',
  supabase_anon_key: '',
  updated_at: new Date().toISOString(),
};

const emptyDatabase: DatabaseSchema = {
  profile: { ...defaultProfile },
  items: [],
  stock_movements: [],
  services: [],
  transactions: [],
  expenses: [],
  activity_logs: [],
};

class BengkelDatabase {
  private data: DatabaseSchema;
  private supabase: SupabaseClient | null = null;

  constructor() {
    this.ensureDataDir();
    if (isVercel && !fs.existsSync(DB_FILE)) {
      try {
        const seedFile = path.resolve(process.cwd(), 'data', 'bengkel_database.json');
        if (fs.existsSync(seedFile)) {
          fs.copyFileSync(seedFile, DB_FILE);
        }
      } catch (err) {
        console.warn('Gagal menyalin seed database ke /tmp:', err);
      }
    }
    this.data = this.loadDatabase();
    this.initSupabaseClient();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          profile: { ...defaultProfile, ...(parsed.profile || {}) },
          items: Array.isArray(parsed.items) ? parsed.items : [],
          stock_movements: Array.isArray(parsed.stock_movements) ? parsed.stock_movements : [],
          services: Array.isArray(parsed.services) ? parsed.services : [],
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
          activity_logs: Array.isArray(parsed.activity_logs) ? parsed.activity_logs : [],
        };
      }
    } catch (err) {
      console.error('Gagal membaca DB_FILE, mencoba fallback ke seed data:', err);
    }

    // Fallback to embedded seed data if DB_FILE is not yet created
    if (initialSeedData) {
      const parsed = initialSeedData as any;
      const initialDb: DatabaseSchema = {
        profile: { ...defaultProfile, ...(parsed.profile || {}) },
        items: Array.isArray(parsed.items) ? parsed.items : [],
        stock_movements: Array.isArray(parsed.stock_movements) ? parsed.stock_movements : [],
        services: Array.isArray(parsed.services) ? parsed.services : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        activity_logs: Array.isArray(parsed.activity_logs) ? parsed.activity_logs : [],
      };
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      } catch (writeErr) {
        console.warn('Gagal menulis initial DB_FILE ke disk:', writeErr);
      }
      return initialDb;
    }

    return {
      profile: { ...defaultProfile },
      items: [],
      stock_movements: [],
      services: [],
      transactions: [],
      expenses: [],
      activity_logs: [],
    };
  }

  private saveDatabase(): void {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      const json = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(tmpFile, json, 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);

      // Sinkronisasi otomatis ke Cloud Supabase jika sudah terhubung
      if (this.supabase) {
        this.syncAllToSupabase().catch(e => console.warn('Supabase auto-sync notice:', e.message));
      }
    } catch (err) {
      console.error('Gagal menyimpan database ke disk:', err);
      throw new Error('Penyimpanan database gagal.');
    }
  }

  private initSupabaseClient() {
    const url = process.env.SUPABASE_URL || this.data.profile.supabase_url;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || this.data.profile.supabase_anon_key;
    if (url && key && url.startsWith('http')) {
      try {
        this.supabase = createClient(url, key);
      } catch (e) {
        console.warn('Inisialisasi Supabase gagal:', e);
        this.supabase = null;
      }
    } else {
      this.supabase = null;
    }
  }

  public getSupabaseStatus(): { connected: boolean; url: string; hasKey: boolean } {
    const url = process.env.SUPABASE_URL || this.data.profile.supabase_url || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || this.data.profile.supabase_anon_key || '';
    return {
      connected: !!(url && key && this.supabase),
      url: url ? url.replace(/^(https?:\/\/[^/]+).*/, '$1') : '',
      hasKey: !!key,
    };
  }

  public async testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.supabase) {
      return { success: false, message: 'Kredensial Supabase URL atau Key belum diisi atau tidak valid.' };
    }
    try {
      const { error } = await this.supabase.from('items').select('id').limit(1);
      if (error) {
        return { success: false, message: `Koneksi Supabase gagal: ${error.message}. Pastikan skrip SQL sudah dijalankan di Supabase SQL Editor.` };
      }
      return { success: true, message: 'Koneksi ke Supabase Cloud aktif & tabel terdeteksi!' };
    } catch (e: any) {
      return { success: false, message: `Error koneksi: ${e.message}` };
    }
  }

  public async syncAllToSupabase(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.supabase) {
      return { success: false, message: 'Supabase belum terhubung.' };
    }

    try {
      // 1. Profile
      const prof = this.data.profile;
      await this.supabase.from('workshop_profile').upsert({
        id: 'default',
        name: prof.name || '',
        tagline: prof.tagline || '',
        address: prof.address || '',
        phone: prof.phone || '',
        boss_whatsapp: prof.boss_whatsapp || '',
        logo_url: prof.logo_url || '',
        banner_url: prof.banner_url || '',
        receipt_footer: prof.receipt_footer || 'Terima kasih atas kunjungan Anda!',
        updated_at: prof.updated_at || new Date().toISOString(),
      });

      // 2. Items
      if (this.data.items.length > 0) {
        const itemRows = this.data.items.map(i => ({
          id: i.id,
          code: i.code,
          name: i.name,
          category: i.category,
          unit: i.unit,
          cost_price: i.cost_price,
          sell_price: i.sell_price,
          stock: i.stock,
          min_stock: i.min_stock,
          created_at: i.created_at,
          updated_at: i.updated_at,
        }));
        await this.supabase.from('items').upsert(itemRows);
      }

      // 3. Services
      if (this.data.services.length > 0) {
        const srvRows = this.data.services.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          description: s.description || '',
          created_at: (s as any).created_at || new Date().toISOString(),
        }));
        await this.supabase.from('services').upsert(srvRows);
      }

      // 4. Transactions
      if (this.data.transactions.length > 0) {
        const trxRows = this.data.transactions.map(t => ({
          id: t.id,
          invoice_no: t.invoice_no,
          date: t.date,
          customer_name: t.customer_name || '',
          customer_phone: t.customer_phone || '',
          vehicle_info: t.vehicle_info || '',
          items: t.items,
          services: t.services,
          items_subtotal: t.items_subtotal,
          services_subtotal: t.services_subtotal,
          subtotal: t.subtotal,
          discount: t.discount,
          total_amount: t.total_amount,
          payment_method: t.payment_method,
          amount_received: t.amount_received,
          change_amount: t.change_amount,
          status: t.status,
          cancellation_reason: t.cancellation_reason || null,
          cancelled_at: t.cancelled_at || null,
          notes: t.notes || '',
          created_at: t.created_at,
        }));
        await this.supabase.from('transactions').upsert(trxRows);
      }

      // 5. Expenses
      if (this.data.expenses.length > 0) {
        const expRows = this.data.expenses.map(e => ({
          id: e.id,
          date: e.date,
          category: e.category,
          description: e.description,
          amount: e.amount,
          receipt_note: e.receipt_note || '',
          created_at: e.created_at || new Date().toISOString(),
        }));
        await this.supabase.from('expenses').upsert(expRows);
      }

      this.logActivity('SYNC_SUPABASE', `Sinkronisasi menyeluruh ke Supabase cloud berhasil.`);
      return {
        success: true,
        message: `Berhasil menyinkronkan ${this.data.items.length} barang, ${this.data.services.length} jasa, dan ${this.data.transactions.length} transaksi ke Supabase Cloud!`,
        details: {
          items: this.data.items.length,
          services: this.data.services.length,
          transactions: this.data.transactions.length,
          expenses: this.data.expenses.length,
        }
      };
    } catch (err: any) {
      console.error('Gagal sync ke Supabase:', err);
      return { success: false, message: `Gagal sinkronisasi: ${err.message}` };
    }
  }

  private logActivity(action: string, details: string) {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
    };
    this.data.activity_logs.unshift(log);
    // Keep max 500 logs
    if (this.data.activity_logs.length > 500) {
      this.data.activity_logs.pop();
    }
  }

  // --- Profile & Settings ---
  public getProfile(): WorkshopProfile {
    return { ...this.data.profile };
  }

  public updateProfile(updates: Partial<WorkshopProfile>): WorkshopProfile {
    this.data.profile = {
      ...this.data.profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveDatabase();
    this.initSupabaseClient();
    this.logActivity('UBAH_PROFIL', `Profil bengkel diperbarui: ${this.data.profile.name || '(tanpa nama)'}`);
    return this.getProfile();
  }

  // --- Items / Stok Barang ---
  public getItems(search?: string, category?: string): Item[] {
    let result = [...this.data.items];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        item => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
      );
    }
    if (category && category !== 'Semua') {
      result = result.filter(item => item.category === category);
    }
    return result;
  }

  public getItemById(id: string): Item | undefined {
    return this.data.items.find(i => i.id === id);
  }

  public createItem(payload: {
    code: string;
    name: string;
    category: string;
    unit: string;
    cost_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
  }): Item {
    const code = payload.code.trim().toUpperCase();
    if (!code) throw new Error('Kode barang wajib diisi');
    if (!payload.name.trim()) throw new Error('Nama barang wajib diisi');
    if (this.data.items.some(i => i.code === code)) {
      throw new Error(`Kode barang "${code}" sudah terdaftar`);
    }

    const newItem: Item = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      code,
      name: payload.name.trim(),
      category: payload.category || 'Umum',
      unit: payload.unit || 'Pcs',
      cost_price: Math.max(0, Math.round(Number(payload.cost_price) || 0)),
      sell_price: Math.max(0, Math.round(Number(payload.sell_price) || 0)),
      stock: Math.max(0, Math.round(Number(payload.stock) || 0)),
      min_stock: Math.max(0, Math.round(Number(payload.min_stock) || 0)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.items.push(newItem);

    // If initial stock was provided, record stock movement
    if (newItem.stock > 0) {
      this.data.stock_movements.unshift({
        id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        item_id: newItem.id,
        item_code: newItem.code,
        item_name: newItem.name,
        type: 'IN_PURCHASE',
        change_qty: newItem.stock,
        stock_before: 0,
        stock_after: newItem.stock,
        reason: 'Stok awal saat pendaftaran barang',
        created_at: new Date().toISOString(),
      });
    }

    this.saveDatabase();
    this.logActivity('TAMBAH_BARANG', `Barang baru: [${newItem.code}] ${newItem.name}`);
    return newItem;
  }

  public updateItem(id: string, payload: Partial<Item>): Item {
    const item = this.getItemById(id);
    if (!item) throw new Error('Barang tidak ditemukan');

    if (payload.code && payload.code.trim().toUpperCase() !== item.code) {
      const code = payload.code.trim().toUpperCase();
      if (this.data.items.some(i => i.id !== id && i.code === code)) {
        throw new Error(`Kode barang "${code}" sudah digunakan oleh barang lain`);
      }
      item.code = code;
    }

    if (payload.name !== undefined) item.name = payload.name.trim();
    if (payload.category !== undefined) item.category = payload.category.trim();
    if (payload.unit !== undefined) item.unit = payload.unit.trim();
    if (payload.cost_price !== undefined) item.cost_price = Math.max(0, Math.round(Number(payload.cost_price)));
    if (payload.sell_price !== undefined) item.sell_price = Math.max(0, Math.round(Number(payload.sell_price)));
    if (payload.min_stock !== undefined) item.min_stock = Math.max(0, Math.round(Number(payload.min_stock)));
    item.updated_at = new Date().toISOString();

    this.saveDatabase();
    this.logActivity('UBAH_BARANG', `Ubah informasi barang: [${item.code}] ${item.name}`);
    return item;
  }

  public deleteItem(id: string): { success: boolean; message: string } {
    const idx = this.data.items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Barang tidak ditemukan');
    const target = this.data.items[idx];

    // Hapus barang dari daftar items
    this.data.items.splice(idx, 1);
    this.saveDatabase();

    // Jika Supabase terhubung, sinkronkan penghapusan
    if (this.supabase) {
      this.supabase.from('items').delete().eq('id', id).then(
        ({ error }) => {
          if (error) console.error('Gagal menghapus item dari Supabase:', error.message);
        },
        (err: any) => console.error('Supabase delete item err:', err)
      );
    }

    this.logActivity('HAPUS_BARANG', `Barang dihapus dari katalog: [${target.code}] ${target.name}`);
    return {
      success: true,
      message: `Barang "${target.name}" (${target.code}) berhasil dihapus.`,
    };
  }

  public adjustStock(payload: {
    item_id: string;
    type: 'IN_PURCHASE' | 'OUT_SALE' | 'ADJUSTMENT';
    quantity: number;
    reason: string;
    reference_no?: string;
    record_expense?: boolean;
    cost_per_unit?: number;
  }): { item: Item; movement: StockMovement } {
    const item = this.getItemById(payload.item_id);
    if (!item) throw new Error('Barang tidak ditemukan');

    const qty = Math.round(Number(payload.quantity));
    if (isNaN(qty) || qty === 0) throw new Error('Jumlah perubahan stok harus berupa angka bukan nol');
    if (!payload.reason || !payload.reason.trim()) throw new Error('Alasan perubahan stok wajib diisi');

    const stockBefore = item.stock;
    let stockAfter = stockBefore;

    if (payload.type === 'IN_PURCHASE') {
      if (qty < 0) throw new Error('Jumlah stok masuk harus positif');
      stockAfter = stockBefore + qty;
    } else if (payload.type === 'OUT_SALE') {
      if (qty < 0) throw new Error('Jumlah stok keluar harus positif');
      if (stockBefore < qty) {
        throw new Error(`Stok tidak mencukupi (tersedia: ${stockBefore}, diminta keluar: ${qty})`);
      }
      stockAfter = stockBefore - qty;
    } else {
      // Penyesuaian stok langsung
      stockAfter = stockBefore + qty;
      if (stockAfter < 0) {
        throw new Error(`Penyesuaian menyebabkan stok menjadi negatif (${stockAfter}). Operasi dibatalkan.`);
      }
    }

    item.stock = stockAfter;
    item.updated_at = new Date().toISOString();

    const movement: StockMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      item_id: item.id,
      item_code: item.code,
      item_name: item.name,
      type: payload.type,
      change_qty: payload.type === 'OUT_SALE' ? -Math.abs(qty) : (payload.type === 'IN_PURCHASE' ? Math.abs(qty) : qty),
      stock_before: stockBefore,
      stock_after: stockAfter,
      reference_no: payload.reference_no,
      reason: payload.reason.trim(),
      created_at: new Date().toISOString(),
    };

    this.data.stock_movements.unshift(movement);

    // If user opts to record inventory purchase expense
    if (payload.type === 'IN_PURCHASE' && payload.record_expense) {
      const unitCost = payload.cost_per_unit ?? item.cost_price;
      const totalCost = unitCost * qty;
      if (totalCost > 0) {
        this.data.expenses.unshift({
          id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          date: new Date().toISOString().split('T')[0],
          category: 'PEMBELIAN_STOK',
          description: `Pembelian persediaan [${item.code}] ${item.name} (${qty} ${item.unit})`,
          amount: totalCost,
          receipt_note: payload.reference_no,
          created_at: new Date().toISOString(),
        });
      }
    }

    this.saveDatabase();
    this.logActivity('PENYESUAIAN_STOK', `Stok [${item.code}] ${item.name} berubah dari ${stockBefore} menjadi ${stockAfter}. Alasan: ${payload.reason}`);
    return { item, movement };
  }

  public getStockMovements(itemId?: string): StockMovement[] {
    if (itemId) {
      return this.data.stock_movements.filter(m => m.item_id === itemId);
    }
    return [...this.data.stock_movements];
  }

  // --- Services / Jasa Servis ---
  public getServices(includeInactive = false): ServiceItem[] {
    if (includeInactive) {
      return [...this.data.services];
    }
    return this.data.services.filter(s => s.is_active !== false);
  }

  public createService(payload: {
    name: string;
    price: number;
    description?: string;
    category?: string;
  }): ServiceItem {
    if (!payload.name.trim()) throw new Error('Nama jasa servis wajib diisi');
    const newService: ServiceItem = {
      id: `srv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: payload.name.trim(),
      price: Math.max(0, Math.round(Number(payload.price) || 0)),
      category: payload.category?.trim() || 'Servis & Perawatan',
      description: payload.description?.trim(),
      is_active: true,
    };
    this.data.services.push(newService);
    this.saveDatabase();
    this.logActivity('TAMBAH_JASA', `Jasa servis baru: ${newService.name} (Rp ${newService.price.toLocaleString('id-ID')})`);
    return newService;
  }

  public updateService(id: string, payload: Partial<ServiceItem>): ServiceItem {
    const service = this.data.services.find(s => s.id === id);
    if (!service) throw new Error('Jasa servis tidak ditemukan');
    if (payload.name !== undefined) {
      if (!payload.name.trim()) throw new Error('Nama jasa servis tidak boleh kosong');
      service.name = payload.name.trim();
    }
    if (payload.price !== undefined) {
      service.price = Math.max(0, Math.round(Number(payload.price) || 0));
    }
    if (payload.category !== undefined) {
      service.category = payload.category.trim();
    }
    if (payload.description !== undefined) {
      service.description = payload.description.trim();
    }
    if (payload.is_active !== undefined) {
      service.is_active = payload.is_active;
    }
    this.saveDatabase();
    this.logActivity('UBAH_JASA', `Jasa servis diubah: ${service.name} (Rp ${service.price.toLocaleString('id-ID')})`);
    return service;
  }

  public deleteService(id: string): { success: boolean; archived: boolean; message: string } {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Jasa servis tidak ditemukan');
    const target = this.data.services[idx];

    // Check if service is referenced in any historic transaction
    const isUsedInTransactions = this.data.transactions.some(t =>
      t.services && t.services.some(s => s.service_id === id || s.name.toLowerCase() === target.name.toLowerCase())
    );

    if (isUsedInTransactions) {
      // Archive/deactivate to preserve historical receipt & financial integrity
      target.is_active = false;
      this.saveDatabase();
      this.logActivity('ARSIP_JASA', `Jasa servis diarsipkan karena telah digunakan dalam transaksi: ${target.name}`);
      return {
        success: true,
        archived: true,
        message: 'Jasa dinonaktifkan / diarsipkan karena sudah tercatat dalam riwayat transaksi sebelumnya.',
      };
    } else {
      this.data.services.splice(idx, 1);
      this.saveDatabase();
      this.logActivity('HAPUS_JASA', `Jasa servis dihapus permanen: ${target.name}`);
      return {
        success: true,
        archived: false,
        message: 'Jasa servis berhasil dihapus.',
      };
    }
  }

  // --- Transactions / Kasir ---
  public getTransactions(limit = 100): Transaction[] {
    return [...this.data.transactions].slice(0, limit);
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.data.transactions.find(t => t.id === id || t.invoice_no === id);
  }

  private generateInvoiceNumber(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `TRX-${yyyy}${mm}${dd}`;

    // Count today's transactions to get sequential counter
    const todayCount = this.data.transactions.filter(t => t.invoice_no.startsWith(prefix)).length + 1;
    const seq = String(todayCount).padStart(4, '0');
    return `${prefix}-${seq}`;
  }

  /**
   * Atomic Transaction Creation:
   * Validates stock availability, deducts stock, creates stock movements,
   * generates unique invoice, records transaction. Everything commits atomically!
   */
  public createTransaction(payload: {
    items: { item_id: string; qty: number }[];
    services: { service_id?: string; name: string; price: number; qty: number }[];
    customer_name?: string;
    customer_phone?: string;
    vehicle_info?: string;
    discount?: number;
    payment_method: 'TUNAI' | 'TRANSFER' | 'QRIS';
    amount_received: number;
    notes?: string;
  }): Transaction {
    if ((!payload.items || payload.items.length === 0) && (!payload.services || payload.services.length === 0)) {
      throw new Error('Transaksi harus memiliki minimal 1 barang atau jasa servis');
    }

    // Step 1: Pre-validate all inventory items and check stock levels
    const resolvedItems: {
      item: Item;
      qty: number;
      unitCost: number;
      unitSell: number;
      subtotal: number;
    }[] = [];

    if (payload.items && payload.items.length > 0) {
      for (const cartItem of payload.items) {
        const item = this.getItemById(cartItem.item_id);
        if (!item) {
          throw new Error(`Barang dengan ID ${cartItem.item_id} tidak ditemukan.`);
        }
        const qty = Math.round(Number(cartItem.qty));
        if (qty <= 0) {
          throw new Error(`Jumlah untuk ${item.name} harus lebih dari 0.`);
        }
        if (item.stock < qty) {
          throw new Error(
            `Stok tidak mencukupi untuk "${item.name}". Stok tersedia: ${item.stock}, diminta: ${qty}.`
          );
        }
        resolvedItems.push({
          item,
          qty,
          unitCost: item.cost_price,
          unitSell: item.sell_price,
          subtotal: item.sell_price * qty,
        });
      }
    }

    // Step 2: Validate services
    const resolvedServices: {
      service_id?: string;
      name: string;
      price: number;
      qty: number;
      subtotal: number;
    }[] = [];

    if (payload.services && payload.services.length > 0) {
      for (const srv of payload.services) {
        const name = srv.name.trim();
        if (!name) throw new Error('Nama jasa servis tidak boleh kosong');
        const price = Math.max(0, Math.round(Number(srv.price) || 0));
        const qty = Math.max(1, Math.round(Number(srv.qty) || 1));
        resolvedServices.push({
          service_id: srv.service_id,
          name,
          price,
          qty,
          subtotal: price * qty,
        });
      }
    }

    // Step 3: Compute totals
    const itemsSubtotal = resolvedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const servicesSubtotal = resolvedServices.reduce((acc, curr) => acc + curr.subtotal, 0);
    const grossSubtotal = itemsSubtotal + servicesSubtotal;
    const discount = Math.max(0, Math.min(grossSubtotal, Math.round(Number(payload.discount) || 0)));
    const totalAmount = grossSubtotal - discount;

    const amountReceived = Math.max(0, Math.round(Number(payload.amount_received) || 0));
    if (payload.payment_method === 'TUNAI' && amountReceived < totalAmount) {
      throw new Error(
        `Uang diterima (Rp ${amountReceived.toLocaleString('id-ID')}) kurang dari total pembayaran (Rp ${totalAmount.toLocaleString('id-ID')})`
      );
    }
    const changeAmount = payload.payment_method === 'TUNAI' ? Math.max(0, amountReceived - totalAmount) : 0;

    const invoiceNo = this.generateInvoiceNumber();
    const transactionId = `trx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();

    // Step 4: Atomically apply stock deduction and movements
    for (const res of resolvedItems) {
      const stockBefore = res.item.stock;
      res.item.stock = stockBefore - res.qty;
      res.item.updated_at = nowIso;

      this.data.stock_movements.unshift({
        id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        item_id: res.item.id,
        item_code: res.item.code,
        item_name: res.item.name,
        type: 'OUT_SALE',
        change_qty: -res.qty,
        stock_before: stockBefore,
        stock_after: res.item.stock,
        reference_no: invoiceNo,
        reason: `Penjualan Kasir Nota ${invoiceNo}`,
        created_at: nowIso,
      });
    }

    // Step 5: Construct Transaction record
    const transaction: Transaction = {
      id: transactionId,
      invoice_no: invoiceNo,
      date: nowIso,
      customer_name: payload.customer_name?.trim() || undefined,
      customer_phone: payload.customer_phone?.trim() || undefined,
      vehicle_info: payload.vehicle_info?.trim() || undefined,
      items: resolvedItems.map(r => ({
        item_id: r.item.id,
        item_code: r.item.code,
        item_name: r.item.name,
        unit: r.item.unit,
        cost_price: r.unitCost,
        sell_price: r.unitSell,
        qty: r.qty,
        subtotal: r.subtotal,
      })),
      services: resolvedServices,
      items_subtotal: itemsSubtotal,
      services_subtotal: servicesSubtotal,
      subtotal: grossSubtotal,
      discount,
      total_amount: totalAmount,
      payment_method: payload.payment_method,
      amount_received: payload.payment_method === 'TUNAI' ? amountReceived : totalAmount,
      change_amount: changeAmount,
      status: 'COMPLETED',
      notes: payload.notes?.trim() || undefined,
      created_at: nowIso,
    };

    this.data.transactions.unshift(transaction);
    this.saveDatabase();
    this.logActivity('TRANSAKSI_SELESAI', `Transaksi berhasil dibuat: ${invoiceNo} sebesar Rp ${totalAmount.toLocaleString('id-ID')}`);
    return transaction;
  }

  /**
   * Cancel Transaction with atomic stock reversion
   */
  public cancelTransaction(id: string, reason: string): Transaction {
    const trx = this.data.transactions.find(t => t.id === id || t.invoice_no === id);
    if (!trx) throw new Error('Transaksi tidak ditemukan');
    if (trx.status === 'CANCELLED') throw new Error('Transaksi sudah dibatalkan sebelumnya');
    if (!reason || !reason.trim()) throw new Error('Alasan pembatalan wajib diisi');

    const nowIso = new Date().toISOString();

    // Revert stock for each sold item
    for (const trxItem of trx.items) {
      const item = this.getItemById(trxItem.item_id);
      if (item) {
        const stockBefore = item.stock;
        item.stock = stockBefore + trxItem.qty;
        item.updated_at = nowIso;

        this.data.stock_movements.unshift({
          id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          item_id: item.id,
          item_code: item.code,
          item_name: item.name,
          type: 'RETURN_CANCEL',
          change_qty: trxItem.qty,
          stock_before: stockBefore,
          stock_after: item.stock,
          reference_no: trx.invoice_no,
          reason: `Pengembalian stok pembatalan transaksi ${trx.invoice_no}: ${reason.trim()}`,
          created_at: nowIso,
        });
      }
    }

    trx.status = 'CANCELLED';
    trx.cancellation_reason = reason.trim();
    trx.cancelled_at = nowIso;

    this.saveDatabase();
    this.logActivity('BATAL_TRANSAKSI', `Transaksi dibatalkan: ${trx.invoice_no}. Alasan: ${reason}`);
    return trx;
  }

  /**
   * Update / Edit saved transaction with atomic stock recalculation and synchronization
   */
  public updateTransaction(
    id: string,
    payload: {
      customer_name?: string;
      customer_phone?: string;
      vehicle_info?: string;
      notes?: string;
      items: { item_id: string; qty: number; sell_price?: number }[];
      services: { service_id?: string; name: string; price: number; qty: number }[];
      discount?: number;
      payment_method?: 'TUNAI' | 'TRANSFER' | 'QRIS';
      amount_received?: number;
    }
  ): Transaction {
    const trx = this.data.transactions.find(t => t.id === id || t.invoice_no === id);
    if (!trx) throw new Error('Nota transaksi tidak ditemukan.');
    if (trx.status === 'CANCELLED') throw new Error('Nota yang sudah dibatalkan tidak dapat diedit.');

    if ((!payload.items || payload.items.length === 0) && (!payload.services || payload.services.length === 0)) {
      throw new Error('Transaksi harus memiliki minimal 1 barang atau jasa servis');
    }

    const nowIso = new Date().toISOString();

    // 1. First, calculate effective stock availability by temporarily reverting old sold items
    // Map of itemId -> temp available stock
    const itemStockMap = new Map<string, number>();
    for (const oldItem of trx.items) {
      const dbItem = this.getItemById(oldItem.item_id);
      if (dbItem) {
        itemStockMap.set(dbItem.id, (itemStockMap.get(dbItem.id) ?? dbItem.stock) + oldItem.qty);
      }
    }

    // 2. Validate new requested items against available stock
    const resolvedItems: {
      item: Item;
      qty: number;
      unitCost: number;
      unitSell: number;
      subtotal: number;
    }[] = [];

    for (const reqItem of payload.items) {
      const dbItem = this.getItemById(reqItem.item_id);
      if (!dbItem) throw new Error(`Barang dengan ID ${reqItem.item_id} tidak ditemukan.`);
      const qty = Math.round(Number(reqItem.qty));
      if (qty <= 0) throw new Error(`Jumlah untuk ${dbItem.name} harus lebih dari 0.`);

      const availableStock = itemStockMap.has(dbItem.id) ? itemStockMap.get(dbItem.id)! : dbItem.stock;
      if (availableStock < qty) {
        throw new Error(
          `Stok tidak mencukupi untuk "${dbItem.name}". Stok tersedia: ${availableStock}, diminta: ${qty}.`
        );
      }
      // Deduct from temporary map
      itemStockMap.set(dbItem.id, availableStock - qty);

      // Sell price: use custom if provided, otherwise dbItem sell price or preserved cost
      const unitSell = reqItem.sell_price !== undefined && reqItem.sell_price >= 0
        ? Math.round(reqItem.sell_price)
        : dbItem.sell_price;
      const unitCost = dbItem.cost_price;

      resolvedItems.push({
        item: dbItem,
        qty,
        unitCost,
        unitSell,
        subtotal: unitSell * qty,
      });
    }

    // 3. Resolve services
    const resolvedServices: {
      service_id?: string;
      name: string;
      price: number;
      qty: number;
      subtotal: number;
    }[] = [];

    if (payload.services && payload.services.length > 0) {
      for (const srv of payload.services) {
        const name = srv.name?.trim();
        if (!name) throw new Error('Nama jasa servis tidak boleh kosong');
        const price = Math.max(0, Math.round(Number(srv.price) || 0));
        const qty = Math.max(1, Math.round(Number(srv.qty) || 1));
        resolvedServices.push({
          service_id: srv.service_id,
          name,
          price,
          qty,
          subtotal: price * qty,
        });
      }
    }

    // 4. Calculate subtotal, discount, totals
    const itemsSubtotal = resolvedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const servicesSubtotal = resolvedServices.reduce((acc, curr) => acc + curr.subtotal, 0);
    const grossSubtotal = itemsSubtotal + servicesSubtotal;
    const discount = Math.max(0, Math.min(grossSubtotal, Math.round(Number(payload.discount) || 0)));
    const totalAmount = grossSubtotal - discount;

    const paymentMethod = payload.payment_method || trx.payment_method;
    const amountReceived = payload.amount_received !== undefined
      ? Math.max(0, Math.round(Number(payload.amount_received) || 0))
      : (paymentMethod === 'TUNAI' ? Math.max(totalAmount, trx.amount_received) : totalAmount);

    if (paymentMethod === 'TUNAI' && amountReceived < totalAmount) {
      throw new Error(
        `Uang diterima (Rp ${amountReceived.toLocaleString('id-ID')}) kurang dari total pembayaran (Rp ${totalAmount.toLocaleString('id-ID')})`
      );
    }
    const changeAmount = paymentMethod === 'TUNAI' ? Math.max(0, amountReceived - totalAmount) : 0;

    // 5. Revert old stock deduction
    for (const oldItem of trx.items) {
      const dbItem = this.getItemById(oldItem.item_id);
      if (dbItem) {
        dbItem.stock += oldItem.qty;
        dbItem.updated_at = nowIso;
      }
    }

    // 6. Apply new stock deduction and record adjustment movement
    for (const newItem of resolvedItems) {
      const dbItem = newItem.item;
      const stockBefore = dbItem.stock;
      dbItem.stock = stockBefore - newItem.qty;
      dbItem.updated_at = nowIso;

      this.data.stock_movements.unshift({
        id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        item_id: dbItem.id,
        item_code: dbItem.code,
        item_name: dbItem.name,
        type: 'ADJUSTMENT',
        change_qty: -newItem.qty,
        stock_before: stockBefore,
        stock_after: dbItem.stock,
        reference_no: trx.invoice_no,
        reason: `Revisi Nota ${trx.invoice_no}: penyesuaian stok baru ${newItem.qty} ${dbItem.unit}`,
        created_at: nowIso,
      });
    }

    // 7. Update transaction object in-place
    trx.customer_name = payload.customer_name?.trim() || undefined;
    trx.customer_phone = payload.customer_phone?.trim() || undefined;
    trx.vehicle_info = payload.vehicle_info?.trim() || undefined;
    trx.notes = payload.notes?.trim() || undefined;
    trx.items = resolvedItems.map(r => ({
      item_id: r.item.id,
      item_code: r.item.code,
      item_name: r.item.name,
      unit: r.item.unit,
      cost_price: r.unitCost,
      sell_price: r.unitSell,
      qty: r.qty,
      subtotal: r.subtotal,
    }));
    trx.services = resolvedServices;
    trx.items_subtotal = itemsSubtotal;
    trx.services_subtotal = servicesSubtotal;
    trx.subtotal = grossSubtotal;
    trx.discount = discount;
    trx.total_amount = totalAmount;
    trx.payment_method = paymentMethod;
    trx.amount_received = paymentMethod === 'TUNAI' ? amountReceived : totalAmount;
    trx.change_amount = changeAmount;

    this.saveDatabase();
    this.logActivity('EDIT_TRANSAKSI', `Nota ${trx.invoice_no} diperbarui. Total baru Rp ${totalAmount.toLocaleString('id-ID')}`);
    return trx;
  }

  // --- Expenses / Pengeluaran ---
  public getExpenses(): Expense[] {
    return [...this.data.expenses];
  }

  public createExpense(payload: {
    date: string;
    category: Expense['category'];
    description: string;
    amount: number;
    receipt_note?: string;
  }): Expense {
    if (!payload.description.trim()) throw new Error('Keterangan pengeluaran wajib diisi');
    const amount = Math.max(0, Math.round(Number(payload.amount) || 0));
    if (amount <= 0) throw new Error('Nominal pengeluaran harus lebih besar dari 0');

    const newExpense: Expense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: payload.date || new Date().toISOString().split('T')[0],
      category: payload.category || 'OPERASIONAL',
      description: payload.description.trim(),
      amount,
      receipt_note: payload.receipt_note?.trim(),
      created_at: new Date().toISOString(),
    };

    this.data.expenses.unshift(newExpense);
    this.saveDatabase();
    this.logActivity('TAMBAH_PENGELUARAN', `Pengeluaran [${newExpense.category}]: ${newExpense.description} (Rp ${amount.toLocaleString('id-ID')})`);
    return newExpense;
  }

  public deleteExpense(id: string): void {
    const idx = this.data.expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      const removed = this.data.expenses.splice(idx, 1)[0];
      this.saveDatabase();
      this.logActivity('HAPUS_PENGELUARAN', `Pengeluaran dihapus: ${removed.description}`);
    }
  }

  // --- Activity Logs ---
  public getActivityLogs(limit = 100): ActivityLog[] {
    return this.data.activity_logs.slice(0, limit);
  }

  // --- Dashboard Aggregations (Calculated strictly from database) ---
  public getDashboardStats(): DashboardStats {
    const todayStr = new Date().toISOString().split('T')[0];

    const completedTrx = this.data.transactions.filter(t => t.status === 'COMPLETED');
    const todayTrx = completedTrx.filter(t => t.date.startsWith(todayStr));

    const todayRevenue = todayTrx.reduce((sum, t) => sum + t.total_amount, 0);
    const totalIncome = completedTrx.reduce((sum, t) => sum + t.total_amount, 0);

    // Calculate total COGS (Cost of Goods Sold) for sold parts
    let totalCogs = 0;
    for (const trx of completedTrx) {
      for (const it of trx.items) {
        totalCogs += (it.cost_price || 0) * it.qty;
      }
    }

    // Operational expenses (excluding PEMBELIAN_STOK to avoid double counting with COGS)
    const operationalExpenses = this.data.expenses
      .filter(e => e.category !== 'PEMBELIAN_STOK')
      .reduce((sum, e) => sum + e.amount, 0);

    const grossProfit = totalIncome - totalCogs;
    const netProfit = grossProfit - operationalExpenses;

    const lowStockItems = this.data.items.filter(item => item.stock <= item.min_stock);

    return {
      today_revenue: todayRevenue,
      today_transactions_count: todayTrx.length,
      total_income: totalIncome,
      total_expense: operationalExpenses,
      total_cogs: totalCogs,
      gross_profit: grossProfit,
      net_profit: netProfit,
      low_stock_count: lowStockItems.length,
      low_stock_items: lowStockItems,
      recent_transactions: completedTrx.slice(0, 10),
    };
  }

  // --- Financial Report Summary ---
  public getFinancialReport(startDate?: string, endDate?: string): FinancialReportSummary {
    const completedTrx = this.data.transactions.filter(t => {
      if (t.status !== 'COMPLETED') return false;
      const tDate = t.date.split('T')[0];
      if (startDate && tDate < startDate) return false;
      if (endDate && tDate > endDate) return false;
      return true;
    });

    const filteredExpenses = this.data.expenses.filter(e => {
      const eDate = e.date.split('T')[0];
      if (startDate && eDate < startDate) return false;
      if (endDate && eDate > endDate) return false;
      return true;
    });

    const partsSales = completedTrx.reduce((sum, t) => sum + t.items_subtotal, 0);
    const serviceRevenue = completedTrx.reduce((sum, t) => sum + t.services_subtotal, 0);
    const totalIncome = completedTrx.reduce((sum, t) => sum + t.total_amount, 0);

    let cogsTotal = 0;
    for (const t of completedTrx) {
      for (const it of t.items) {
        cogsTotal += (it.cost_price || 0) * it.qty;
      }
    }

    const grossProfit = totalIncome - cogsTotal;

    const inventoryPurchases = filteredExpenses
      .filter(e => e.category === 'PEMBELIAN_STOK')
      .reduce((sum, e) => sum + e.amount, 0);

    const operationalExpenses = filteredExpenses
      .filter(e => e.category !== 'PEMBELIAN_STOK')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = operationalExpenses + inventoryPurchases;
    const netProfit = grossProfit - operationalExpenses;

    let periodLabel = 'Semua Waktu';
    if (startDate && endDate) {
      periodLabel = startDate === endDate ? `Tanggal ${startDate}` : `${startDate} s/d ${endDate}`;
    } else if (startDate) {
      periodLabel = `Sejak ${startDate}`;
    } else if (endDate) {
      periodLabel = `Hingga ${endDate}`;
    }

    const cancelledCount = this.data.transactions.filter(t => {
      if (t.status !== 'CANCELLED') return false;
      const tDate = t.date.split('T')[0];
      if (startDate && tDate < startDate) return false;
      if (endDate && tDate > endDate) return false;
      return true;
    }).length;

    return {
      period_label: periodLabel,
      start_date: startDate || '',
      end_date: endDate || '',
      parts_sales: partsSales,
      service_revenue: serviceRevenue,
      total_income: totalIncome,
      cogs_total: cogsTotal,
      gross_profit: grossProfit,
      inventory_purchases: inventoryPurchases,
      operational_expenses: operationalExpenses,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      transaction_count: completedTrx.length,
      cancelled_count: cancelledCount,
      transactions: completedTrx,
      expenses: filteredExpenses,
    };
  }

  // --- Backup & Restore ---
  public exportBackup(): DatabaseBackup {
    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      profile: this.data.profile,
      items: this.data.items,
      stock_movements: this.data.stock_movements,
      services: this.data.services,
      transactions: this.data.transactions,
      expenses: this.data.expenses,
      activity_logs: this.data.activity_logs,
    };
  }

  public importBackup(backup: Partial<DatabaseBackup>): { success: boolean; message: string } {
    if (!backup || typeof backup !== 'object') {
      throw new Error('Format file backup tidak valid');
    }

    if (!Array.isArray(backup.items) && !Array.isArray(backup.transactions)) {
      throw new Error('File backup tidak memiliki struktur data bengkel yang sesuai');
    }

    this.data = {
      profile: backup.profile ? { ...defaultProfile, ...backup.profile } : this.data.profile,
      items: Array.isArray(backup.items) ? backup.items : [],
      stock_movements: Array.isArray(backup.stock_movements) ? backup.stock_movements : [],
      services: Array.isArray(backup.services) ? backup.services : [],
      transactions: Array.isArray(backup.transactions) ? backup.transactions : [],
      expenses: Array.isArray(backup.expenses) ? backup.expenses : [],
      activity_logs: Array.isArray(backup.activity_logs) ? backup.activity_logs : [],
    };

    this.saveDatabase();
    this.logActivity('RESTORE_DATA', `Pemulihan data cadangan berhasil dilakukan.`);
    return { success: true, message: 'Data cadangan berhasil dipulihkan.' };
  }

  // --- SQL Schema generator for Supabase migration ---
  public getSupabaseSqlSchema(): string {
    return `-- ====================================================================
-- SKRIP MIGRASI DATABASE SUPABASE / POSTGRESQL - BENGKELPRO
-- Salin dan jalankan skrip ini di Supabase SQL Editor jika Anda menghubungkan
-- project Supabase mandiri Anda.
-- ====================================================================

-- 1. Tabel Profil Bengkel
CREATE TABLE IF NOT EXISTS workshop_profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT '',
  tagline TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  boss_whatsapp TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  receipt_footer TEXT DEFAULT 'Terima kasih atas kunjungan Anda!',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Master Barang & Stok
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Umum',
  unit TEXT NOT NULL DEFAULT 'Pcs',
  cost_price BIGINT NOT NULL DEFAULT 0,
  sell_price BIGINT NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);

-- 3. Tabel Riwayat Pergerakan Stok
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES items(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'IN_PURCHASE', 'OUT_SALE', 'ADJUSTMENT', 'RETURN_CANCEL'
  change_qty INT NOT NULL,
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  reference_no TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_movements_item ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_created ON stock_movements(created_at);

-- 4. Tabel Master Jasa Servis
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price BIGINT NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Transaksi / Nota Kasir
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  invoice_no TEXT UNIQUE NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT,
  customer_phone TEXT,
  vehicle_info TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  items_subtotal BIGINT NOT NULL DEFAULT 0,
  services_subtotal BIGINT NOT NULL DEFAULT 0,
  subtotal BIGINT NOT NULL DEFAULT 0,
  discount BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'TUNAI',
  amount_received BIGINT NOT NULL DEFAULT 0,
  change_amount BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'COMPLETED', -- 'COMPLETED', 'CANCELLED'
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON transactions(invoice_no);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- 6. Tabel Pengeluaran Operasional
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  receipt_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- 7. Tabel Log Aktivitas
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  details TEXT NOT NULL
);

-- 8. Pengaturan Row Level Security (RLS)
ALTER TABLE workshop_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses aman untuk backend server bengkel
CREATE POLICY "Server Full Access Profile" ON workshop_profile FOR ALL USING (true);
CREATE POLICY "Server Full Access Items" ON items FOR ALL USING (true);
CREATE POLICY "Server Full Access Movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Server Full Access Services" ON services FOR ALL USING (true);
CREATE POLICY "Server Full Access Transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Server Full Access Expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Server Full Access Logs" ON activity_logs FOR ALL USING (true);
`;
  }
}

export const db = new BengkelDatabase();
