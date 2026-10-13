import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall.js';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Status koneksi offline" className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50 flex items-center gap-3 rounded-xl bg-amber-600 px-4 py-3 text-xs font-medium text-white shadow-xl animate-bounce-subtle">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-700">
        <WifiOff className="h-4 w-4 text-white" />
      </div>
      <div>
        <div className="font-semibold flex items-center gap-1.5">
          <span>Mode Offline Terdeteksi</span>
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
        <p className="mt-0.5 text-amber-100 text-[11px] leading-tight">
          Aset halaman tetap berjalan melalui cache Service Worker. Transaksi baru membutuhkan koneksi server aktif agar stok berkurang secara atomik.
        </p>
      </div>
    </aside>
  );
};
