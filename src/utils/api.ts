import type {
  Item,
  StockMovement,
  ServiceItem,
  Transaction,
  Expense,
  WorkshopProfile,
  DashboardStats,
  FinancialReportSummary,
  ActivityLog,
  DatabaseBackup,
} from '../types/bengkel.js';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Permintaan gagal (status ${res.status})`;
    try {
      const data = await res.json();
      if (data && data.error) {
        errorMsg = data.error;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Profile
  getProfile: async (): Promise<{ profile: WorkshopProfile; dbStatus: { connected: boolean; url: string; hasKey: boolean } }> => {
    const res = await fetch('/api/profile');
    return handleResponse(res);
  },

  updateProfile: async (profile: Partial<WorkshopProfile>): Promise<{ success: boolean; profile: WorkshopProfile }> => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return handleResponse(res);
  },

  uploadImage: async (imageBase64: string): Promise<{ success: boolean; url: string }> => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });
    return handleResponse(res);
  },

  // Items / Stok
  getItems: async (search?: string, category?: string): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const res = await fetch(`/api/items?${params.toString()}`);
    return handleResponse(res);
  },

  createItem: async (data: {
    code: string;
    name: string;
    category: string;
    unit: string;
    cost_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
  }): Promise<Item> => {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateItem: async (id: string, data: Partial<Item>): Promise<Item> => {
    const res = await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteItem: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  adjustStock: async (
    id: string,
    data: {
      type: 'IN_PURCHASE' | 'OUT_SALE' | 'ADJUSTMENT';
      quantity: number;
      reason: string;
      reference_no?: string;
      record_expense?: boolean;
      cost_per_unit?: number;
    }
  ): Promise<{ item: Item; movement: StockMovement }> => {
    const res = await fetch(`/api/items/${id}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getMovements: async (itemId?: string): Promise<StockMovement[]> => {
    const query = itemId ? `?itemId=${encodeURIComponent(itemId)}` : '';
    const res = await fetch(`/api/movements${query}`);
    return handleResponse(res);
  },

  // Services
  getServices: async (includeInactive = false): Promise<ServiceItem[]> => {
    const res = await fetch(`/api/services${includeInactive ? '?all=true' : ''}`);
    return handleResponse(res);
  },

  createService: async (data: { name: string; price: number; description?: string; category?: string }): Promise<ServiceItem> => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateService: async (id: string, data: Partial<ServiceItem>): Promise<ServiceItem> => {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteService: async (id: string): Promise<{ success: boolean; archived: boolean; message: string }> => {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Transactions
  getTransactions: async (limit = 100): Promise<Transaction[]> => {
    const res = await fetch(`/api/transactions?limit=${limit}`);
    return handleResponse(res);
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const res = await fetch(`/api/transactions/${id}`);
    return handleResponse(res);
  },

  createTransaction: async (data: {
    items: { item_id: string; qty: number }[];
    services: { service_id?: string; name: string; price: number; qty: number }[];
    customer_name?: string;
    customer_phone?: string;
    vehicle_info?: string;
    discount?: number;
    payment_method: 'TUNAI' | 'TRANSFER' | 'QRIS';
    amount_received: number;
    notes?: string;
  }): Promise<Transaction> => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  cancelTransaction: async (id: string, reason: string): Promise<Transaction> => {
    const res = await fetch(`/api/transactions/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  updateTransaction: async (
    id: string,
    data: {
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
  ): Promise<Transaction> => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    const res = await fetch('/api/expenses');
    return handleResponse(res);
  },

  createExpense: async (data: {
    date: string;
    category: Expense['category'];
    description: string;
    amount: number;
    receipt_note?: string;
  }): Promise<Expense> => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteExpense: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Dashboard & Reports
  getDashboard: async (): Promise<DashboardStats> => {
    const res = await fetch('/api/dashboard');
    return handleResponse(res);
  },

  getReports: async (startDate?: string, endDate?: string): Promise<FinancialReportSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`/api/reports?${params.toString()}`);
    return handleResponse(res);
  },

  // WhatsApp
  getWhatsAppPreview: async (period: string, startDate?: string, endDate?: string): Promise<{
    boss_whatsapp: string;
    message_text: string;
    whatsapp_url: string;
    report: FinancialReportSummary;
  }> => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`/api/whatsapp/preview?${params.toString()}`);
    return handleResponse(res);
  },

  // Database & Backup
  exportBackup: async (): Promise<DatabaseBackup> => {
    const res = await fetch('/api/backup/export');
    return handleResponse(res);
  },

  restoreBackup: async (backupData: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData),
    });
    return handleResponse(res);
  },

  getDatabaseStatus: async (): Promise<{ connected: boolean; url: string; hasKey: boolean }> => {
    const res = await fetch('/api/database/status');
    return handleResponse(res);
  },

  testDatabaseConnection: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/database/test', { method: 'POST' });
    return handleResponse(res);
  },

  syncDatabaseToCloud: async (): Promise<{ success: boolean; message: string; details?: any }> => {
    const res = await fetch('/api/database/sync', { method: 'POST' });
    return handleResponse(res);
  },

  getSqlSchema: async (): Promise<{ sql: string }> => {
    const res = await fetch('/api/database/schema-sql');
    return handleResponse(res);
  },

  getLogs: async (): Promise<ActivityLog[]> => {
    const res = await fetch('/api/logs');
    return handleResponse(res);
  },
};
