export type PaymentMethod = 'TUNAI' | 'TRANSFER' | 'QRIS';

export type TransactionStatus = 'COMPLETED' | 'CANCELLED';

export type StockMovementType = 'IN_PURCHASE' | 'OUT_SALE' | 'ADJUSTMENT' | 'RETURN_CANCEL';

export type ExpenseCategory =
  | 'OPERASIONAL'
  | 'LISTRIK_AIR'
  | 'GAJI_KARYAWAN'
  | 'SEWA_TEMPAT'
  | 'ALAT_BENGKEL'
  | 'PEMBELIAN_STOK'
  | 'LAINNYA';

export interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  cost_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  item_id: string;
  item_code: string;
  item_name: string;
  type: StockMovementType;
  change_qty: number;
  stock_before: number;
  stock_after: number;
  reference_no?: string;
  reason: string;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  is_active?: boolean;
}

export interface StampConfig {
  enabled: boolean;
  image_url?: string;
  size: number; // width in px, default 85
  position: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'signature-overlap';
  opacity: number; // 0.1 to 1.0, default 0.85
  offset_x: number; // fine-tuning offset x in px
  offset_y: number; // fine-tuning offset y in px
}

export interface TransactionItem {
  item_id: string;
  item_code: string;
  item_name: string;
  unit: string;
  cost_price: number;
  sell_price: number;
  qty: number;
  subtotal: number;
}

export interface TransactionService {
  service_id?: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoice_no: string;
  date: string;
  customer_name?: string;
  customer_phone?: string;
  vehicle_info?: string;
  items: TransactionItem[];
  services: TransactionService[];
  items_subtotal: number;
  services_subtotal: number;
  subtotal: number;
  discount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  amount_received: number;
  change_amount: number;
  status: TransactionStatus;
  cancellation_reason?: string;
  cancelled_at?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receipt_note?: string;
  created_at: string;
}

export interface WorkshopProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  boss_whatsapp: string;
  logo_url?: string;
  banner_url?: string;
  stamp_config?: StampConfig;
  receipt_footer: string;
  supabase_url?: string;
  supabase_anon_key?: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface DashboardStats {
  today_revenue: number;
  today_transactions_count: number;
  total_income: number;
  total_expense: number;
  total_cogs: number;
  gross_profit: number;
  net_profit: number;
  low_stock_count: number;
  low_stock_items: Item[];
  recent_transactions: Transaction[];
}

export interface FinancialReportSummary {
  period_label: string;
  start_date: string;
  end_date: string;
  parts_sales: number;
  service_revenue: number;
  total_income: number;
  cogs_total: number;
  gross_profit: number;
  inventory_purchases: number;
  operational_expenses: number;
  total_expenses: number;
  net_profit: number;
  transaction_count: number;
  cancelled_count: number;
  transactions: Transaction[];
  expenses: Expense[];
}

export interface DatabaseBackup {
  version: string;
  exported_at: string;
  profile: WorkshopProfile;
  items: Item[];
  stock_movements: StockMovement[];
  services: ServiceItem[];
  transactions: Transaction[];
  expenses: Expense[];
  activity_logs: ActivityLog[];
}
