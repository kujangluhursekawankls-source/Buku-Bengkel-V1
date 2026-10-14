import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';

dotenv.config();

let appDir = process.cwd();
try {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    appDir = path.dirname(fileURLToPath(import.meta.url));
  }
} catch {
  appDir = process.cwd();
}
const __dirname = appDir;

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure upload directory exists and serve statically
const isVercel = Boolean(process.env.VERCEL);
const UPLOAD_DIR = isVercel ? path.resolve('/tmp', 'uploads') : path.resolve(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    console.warn('Gagal membuat direktori upload:', e);
  }
}
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api/uploads', express.static(UPLOAD_DIR));

// URL normalizer for serverless / proxy environments (e.g. Vercel)
app.use((req: Request, _res: Response, next) => {
  const urlPath = req.url.split('?')[0];
  if (!urlPath.startsWith('/api') && !urlPath.startsWith('/uploads')) {
    const isApiRoute = [
      '/profile', '/upload', '/items', '/movements', '/services',
      '/transactions', '/expenses', '/dashboard', '/reports',
      '/whatsapp', '/backup', '/database', '/logs'
    ].some(prefix => urlPath === prefix || urlPath.startsWith(prefix + '/'));

    if (isApiRoute) {
      req.url = '/api' + req.url;
    }
  }
  next();
});

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Workshop Profile & Settings
app.get('/api/profile', (req: Request, res: Response) => {
  try {
    const profile = db.getProfile();
    const dbStatus = db.getSupabaseStatus();
    res.json({ profile, dbStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil data profil' });
  }
});

app.put('/api/profile', (req: Request, res: Response) => {
  try {
    const updated = db.updateProfile(req.body);
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui profil' });
  }
});

// Image Upload handler (logo / banner)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar wajib disertakan' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Format base64 tidak valid' });
    }

    const ext = matches[1].split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeName}`;

    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengunggah gambar' });
  }
});

// 2. Items & Inventory Management
app.get('/api/items', (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const items = db.getItems(search, category);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil daftar barang' });
  }
});

app.post('/api/items', (req: Request, res: Response) => {
  try {
    const item = db.createItem(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal menambahkan barang' });
  }
});

app.put('/api/items/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateItem(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal mengubah barang' });
  }
});

app.post('/api/items/:id/stock', (req: Request, res: Response) => {
  try {
    const result = db.adjustStock({
      item_id: req.params.id,
      ...req.body,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui stok' });
  }
});

app.get('/api/movements', (req: Request, res: Response) => {
  try {
    const itemId = req.query.itemId as string | undefined;
    const movements = db.getStockMovements(itemId);
    res.json(movements);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil riwayat pergerakan stok' });
  }
});

// 3. Services / Jasa Servis
app.get('/api/services', (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.all === 'true';
    const services = db.getServices(includeInactive);
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil daftar jasa servis' });
  }
});

app.post('/api/services', (req: Request, res: Response) => {
  try {
    const service = db.createService(req.body);
    res.status(201).json(service);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal menambahkan jasa servis' });
  }
});

app.put('/api/services/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateService(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui jasa servis' });
  }
});

app.delete('/api/services/:id', (req: Request, res: Response) => {
  try {
    const result = db.deleteService(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal menghapus jasa servis' });
  }
});

// 4. Transactions / Kasir
app.get('/api/transactions', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const transactions = db.getTransactions(limit);
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil riwayat transaksi' });
  }
});

app.get('/api/transactions/:id', (req: Request, res: Response) => {
  try {
    const trx = db.getTransactionById(req.params.id);
    if (!trx) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    res.json(trx);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil detail transaksi' });
  }
});

app.post('/api/transactions', (req: Request, res: Response) => {
  try {
    const transaction = db.createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Penyimpanan transaksi gagal' });
  }
});

app.post('/api/transactions/:id/cancel', (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const cancelled = db.cancelTransaction(req.params.id, reason);
    res.json(cancelled);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Pembatalan transaksi gagal' });
  }
});

app.put('/api/transactions/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateTransaction(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Pembaruan nota transaksi gagal' });
  }
});

// 5. Expenses / Pengeluaran
app.get('/api/expenses', (req: Request, res: Response) => {
  try {
    const expenses = db.getExpenses();
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil daftar pengeluaran' });
  }
});

app.post('/api/expenses', (req: Request, res: Response) => {
  try {
    const expense = db.createExpense(req.body);
    res.status(201).json(expense);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal mencatat pengeluaran' });
  }
});

app.delete('/api/expenses/:id', (req: Request, res: Response) => {
  try {
    db.deleteExpense(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal menghapus pengeluaran' });
  }
});

// 6. Dashboard Stats
app.get('/api/dashboard', (req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil statistik dashboard' });
  }
});

// 7. Financial Reports
app.get('/api/reports', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const report = db.getFinancialReport(startDate, endDate);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal membuat laporan keuangan' });
  }
});

// 8. WhatsApp Message Formatter
app.get('/api/whatsapp/preview', (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const today = new Date().toISOString().split('T')[0];
    let startDate = today;
    let endDate = today;

    if (period === 'weekly') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      const d = new Date();
      d.setDate(1);
      startDate = d.toISOString().split('T')[0];
    } else if (period === 'custom') {
      startDate = (req.query.startDate as string) || today;
      endDate = (req.query.endDate as string) || today;
    }

    const report = db.getFinancialReport(startDate, endDate);
    const profile = db.getProfile();

    const workshopName = profile.name || 'Bengkel';
    const bossNumber = profile.boss_whatsapp?.replace(/[^0-9]/g, '') || '';

    const formatIdr = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    const text =
`*LAPORAN OPERASIONAL BENGKEL*
----------------------------------------
*Nama Bengkel:* ${workshopName}
*Periode:* ${report.period_label}
*Waktu Cetak:* ${new Date().toLocaleString('id-ID')}

*RINGKASAN KEUANGAN:*
- Penjualan Barang: ${formatIdr(report.parts_sales)}
- Pendapatan Jasa: ${formatIdr(report.service_revenue)}
- *Total Omzet / Pemasukan:* ${formatIdr(report.total_income)}
- *Estimasi Laba Kotor:* ${formatIdr(report.gross_profit)}
- Biaya Operasional: ${formatIdr(report.operational_expenses)}
- Pembelian Persediaan: ${formatIdr(report.inventory_purchases)}
- *Estimasi Laba Bersih:* ${formatIdr(report.net_profit)}

*AKTIVITAS TRANSAKSI:*
- Transaksi Selesai: ${report.transaction_count}
- Transaksi Dibatalkan: ${report.cancelled_count}
----------------------------------------
_Laporan otomatis dibuat dari sistem BengkelPro._`;

    const encodedText = encodeURIComponent(text);
    const waUrl = bossNumber ? `https://wa.me/${bossNumber}?text=${encodedText}` : '';

    res.json({
      boss_whatsapp: bossNumber,
      message_text: text,
      whatsapp_url: waUrl,
      report,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menyiapkan laporan WhatsApp' });
  }
});

// 9. Backup & Restore
app.get('/api/backup/export', (req: Request, res: Response) => {
  try {
    const backup = db.exportBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=bengkelpro-backup-${Date.now()}.json`);
    res.json(backup);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal membuat cadangan database' });
  }
});

app.post('/api/backup/restore', (req: Request, res: Response) => {
  try {
    const result = db.importBackup(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal memulihkan database' });
  }
});

// 10. Database Status & SQL Migration Script
app.get('/api/database/status', (req: Request, res: Response) => {
  try {
    res.json(db.getSupabaseStatus());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/database/test', async (req: Request, res: Response) => {
  try {
    const result = await db.testSupabaseConnection();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/database/sync', async (req: Request, res: Response) => {
  try {
    const result = await db.syncAllToSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/database/schema-sql', (req: Request, res: Response) => {
  try {
    res.json({ sql: db.getSupabaseSqlSchema() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Activity Logs
app.get('/api/logs', (req: Request, res: Response) => {
  try {
    res.json(db.getActivityLogs(50));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// VITE INTEGRATION / CLIENT SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
          overlay: false,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`BengkelPro Server berjalan pada port ${PORT} (http://0.0.0.0:${PORT})`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Gagal menjalankan server:', err);
    process.exit(1);
  });
}

export default app;
