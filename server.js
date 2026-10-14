var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_url = require("url");
var import_dotenv = __toESM(require("dotenv"), 1);

// server/db.js
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_supabase_js = require("@supabase/supabase-js");

// server/seedData.js
var initialSeedData = {
  "profile": {
    "name": "BENGKEL SUTIKNO",
    "tagline": "MOTOR NGACIR",
    "address": "Kp. Nagrak RT 05/03 Desa Nagrak Kec. Gunung Putri Bogor",
    "phone": "628179015181",
    "boss_whatsapp": "628179015181",
    "logo_url": "",
    "banner_url": "",
    "stamp_config": {
      "enabled": false,
      "image_url": "",
      "size": 85,
      "position": "signature-overlap",
      "opacity": 0.85,
      "offset_x": 0,
      "offset_y": 0
    },
    "receipt_footer": "Terima kasih atas kunjungan Anda!",
    "supabase_url": "https://gbwcojnqdzystsugxvfj.supabase.co",
    "supabase_anon_key": "sb_publishable_Dfb4zLbGX_LwPFZZzDK4mA_KV1kN-QV",
    "updated_at": "2026-10-14T05:26:53.119Z"
  },
  "items": [
    {
      "id": "item_1791868857271_png7",
      "code": "BRG-001",
      "name": "Oli Federal",
      "category": "Sparepart",
      "unit": "Botol",
      "cost_price": 5e4,
      "sell_price": 6e4,
      "stock": 50,
      "min_stock": 5,
      "created_at": "2026-10-13T05:20:57.271Z",
      "updated_at": "2026-10-14T05:34:19.611Z"
    },
    {
      "id": "item_1791868875932_7ti5",
      "code": "BRG-002",
      "name": "Bantu Uk. 10",
      "category": "Baut & Mur",
      "unit": "Pcs",
      "cost_price": 5e3,
      "sell_price": 6e3,
      "stock": 100,
      "min_stock": 5,
      "created_at": "2026-10-13T05:21:15.932Z",
      "updated_at": "2026-10-14T05:34:19.611Z"
    },
    {
      "id": "item_1791870050594_u2er",
      "code": "BRG-003",
      "name": "spakboard supra",
      "category": "Aksesoris",
      "unit": "Unit",
      "cost_price": 5e4,
      "sell_price": 75e3,
      "stock": 10,
      "min_stock": 5,
      "created_at": "2026-10-13T05:40:50.594Z",
      "updated_at": "2026-10-14T05:34:11.506Z"
    },
    {
      "id": "item_1791955998427_fu5n",
      "code": "BRG-004",
      "name": "Shell",
      "category": "Oli & Pelumas",
      "unit": "Pcs",
      "cost_price": 45e3,
      "sell_price": 65e3,
      "stock": 100,
      "min_stock": 5,
      "created_at": "2026-10-14T05:33:18.427Z",
      "updated_at": "2026-10-14T05:33:18.428Z"
    }
  ],
  "stock_movements": [
    {
      "id": "mov_1791956059611_20l0",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "RETURN_CANCEL",
      "change_qty": 2,
      "stock_before": 48,
      "stock_after": 50,
      "reference_no": "TRX-20261013-0002",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0002: dada",
      "created_at": "2026-10-14T05:34:19.611Z"
    },
    {
      "id": "mov_1791956059611_ou4l",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "RETURN_CANCEL",
      "change_qty": 2,
      "stock_before": 98,
      "stock_after": 100,
      "reference_no": "TRX-20261013-0002",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0002: dada",
      "created_at": "2026-10-14T05:34:19.611Z"
    },
    {
      "id": "mov_1791956055786_2vpj",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 97,
      "stock_after": 98,
      "reference_no": "TRX-20261013-0001",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0001: atata",
      "created_at": "2026-10-14T05:34:15.786Z"
    },
    {
      "id": "mov_1791956055786_0asp",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 47,
      "stock_after": 48,
      "reference_no": "TRX-20261013-0001",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0001: atata",
      "created_at": "2026-10-14T05:34:15.786Z"
    },
    {
      "id": "mov_1791956051506_6daw",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 9,
      "stock_after": 10,
      "reference_no": "TRX-20261013-0003",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0003: batal",
      "created_at": "2026-10-14T05:34:11.506Z"
    },
    {
      "id": "mov_1791956051506_01lk",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 46,
      "stock_after": 47,
      "reference_no": "TRX-20261013-0003",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0003: batal",
      "created_at": "2026-10-14T05:34:11.506Z"
    },
    {
      "id": "mov_1791956051506_i4xa",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 96,
      "stock_after": 97,
      "reference_no": "TRX-20261013-0003",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0003: batal",
      "created_at": "2026-10-14T05:34:11.506Z"
    },
    {
      "id": "mov_1791956036505_lugc",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 8,
      "stock_after": 9,
      "reference_no": "TRX-20261013-0004",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0004: batal",
      "created_at": "2026-10-14T05:33:56.505Z"
    },
    {
      "id": "mov_1791956036505_9gp4",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "RETURN_CANCEL",
      "change_qty": 10,
      "stock_before": 86,
      "stock_after": 96,
      "reference_no": "TRX-20261013-0004",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0004: batal",
      "created_at": "2026-10-14T05:33:56.505Z"
    },
    {
      "id": "mov_1791956036505_e8af",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 45,
      "stock_after": 46,
      "reference_no": "TRX-20261013-0004",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261013-0004: batal",
      "created_at": "2026-10-14T05:33:56.505Z"
    },
    {
      "id": "mov_1791956016305_femq",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 85,
      "stock_after": 86,
      "reference_no": "TRX-20261014-0002",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261014-0002: batal",
      "created_at": "2026-10-14T05:33:36.305Z"
    },
    {
      "id": "mov_1791956016305_trmm",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 7,
      "stock_after": 8,
      "reference_no": "TRX-20261014-0002",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261014-0002: batal",
      "created_at": "2026-10-14T05:33:36.305Z"
    },
    {
      "id": "mov_1791956016305_vtrq",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 44,
      "stock_after": 45,
      "reference_no": "TRX-20261014-0002",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261014-0002: batal",
      "created_at": "2026-10-14T05:33:36.305Z"
    },
    {
      "id": "mov_1791955998428_yuu1",
      "item_id": "item_1791955998427_fu5n",
      "item_code": "BRG-004",
      "item_name": "Shell",
      "type": "IN_PURCHASE",
      "change_qty": 100,
      "stock_before": 0,
      "stock_after": 100,
      "reason": "Stok awal saat pendaftaran barang",
      "created_at": "2026-10-14T05:33:18.428Z"
    },
    {
      "id": "mov_1791955924752_todx",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 86,
      "stock_after": 85,
      "reference_no": "TRX-20261014-0002",
      "reason": "Penjualan Kasir Nota TRX-20261014-0002",
      "created_at": "2026-10-14T05:32:04.752Z"
    },
    {
      "id": "mov_1791955924752_jzyj",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 8,
      "stock_after": 7,
      "reference_no": "TRX-20261014-0002",
      "reason": "Penjualan Kasir Nota TRX-20261014-0002",
      "created_at": "2026-10-14T05:32:04.752Z"
    },
    {
      "id": "mov_1791955924752_4ymd",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 45,
      "stock_after": 44,
      "reference_no": "TRX-20261014-0002",
      "reason": "Penjualan Kasir Nota TRX-20261014-0002",
      "created_at": "2026-10-14T05:32:04.752Z"
    },
    {
      "id": "mov_1791952025516_9wdg",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 7,
      "stock_after": 8,
      "reference_no": "TRX-20261014-0001",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261014-0001: Tidak Jadi",
      "created_at": "2026-10-14T04:27:05.516Z"
    },
    {
      "id": "mov_1791952025516_wzix",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 85,
      "stock_after": 86,
      "reference_no": "TRX-20261014-0001",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261014-0001: Tidak Jadi",
      "created_at": "2026-10-14T04:27:05.516Z"
    },
    {
      "id": "mov_1791952025516_10f8",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "RETURN_CANCEL",
      "change_qty": 1,
      "stock_before": 44,
      "stock_after": 45,
      "reference_no": "TRX-20261014-0001",
      "reason": "Pengembalian stok pembatalan transaksi TRX-20261014-0001: Tidak Jadi",
      "created_at": "2026-10-14T04:27:05.516Z"
    },
    {
      "id": "mov_1791951225614_vzfu",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 8,
      "stock_after": 7,
      "reference_no": "TRX-20261014-0001",
      "reason": "Penjualan Kasir Nota TRX-20261014-0001",
      "created_at": "2026-10-14T04:13:45.614Z"
    },
    {
      "id": "mov_1791951225614_htzb",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 86,
      "stock_after": 85,
      "reference_no": "TRX-20261014-0001",
      "reason": "Penjualan Kasir Nota TRX-20261014-0001",
      "created_at": "2026-10-14T04:13:45.614Z"
    },
    {
      "id": "mov_1791951225614_1nyu",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 45,
      "stock_after": 44,
      "reference_no": "TRX-20261014-0001",
      "reason": "Penjualan Kasir Nota TRX-20261014-0001",
      "created_at": "2026-10-14T04:13:45.614Z"
    },
    {
      "id": "mov_1791870132207_dfxj",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 9,
      "stock_after": 8,
      "reference_no": "TRX-20261013-0004",
      "reason": "Penjualan Kasir Nota TRX-20261013-0004",
      "created_at": "2026-10-13T05:42:12.207Z"
    },
    {
      "id": "mov_1791870132207_ws17",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "OUT_SALE",
      "change_qty": -10,
      "stock_before": 96,
      "stock_after": 86,
      "reference_no": "TRX-20261013-0004",
      "reason": "Penjualan Kasir Nota TRX-20261013-0004",
      "created_at": "2026-10-13T05:42:12.207Z"
    },
    {
      "id": "mov_1791870132207_9bbc",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 46,
      "stock_after": 45,
      "reference_no": "TRX-20261013-0004",
      "reason": "Penjualan Kasir Nota TRX-20261013-0004",
      "created_at": "2026-10-13T05:42:12.207Z"
    },
    {
      "id": "mov_1791870074858_fsmm",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 10,
      "stock_after": 9,
      "reference_no": "TRX-20261013-0003",
      "reason": "Penjualan Kasir Nota TRX-20261013-0003",
      "created_at": "2026-10-13T05:41:14.858Z"
    },
    {
      "id": "mov_1791870074858_kfx6",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 47,
      "stock_after": 46,
      "reference_no": "TRX-20261013-0003",
      "reason": "Penjualan Kasir Nota TRX-20261013-0003",
      "created_at": "2026-10-13T05:41:14.858Z"
    },
    {
      "id": "mov_1791870074858_hbr9",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 97,
      "stock_after": 96,
      "reference_no": "TRX-20261013-0003",
      "reason": "Penjualan Kasir Nota TRX-20261013-0003",
      "created_at": "2026-10-13T05:41:14.858Z"
    },
    {
      "id": "mov_1791870050594_s6cm",
      "item_id": "item_1791870050594_u2er",
      "item_code": "BRG-003",
      "item_name": "spakboard supra",
      "type": "IN_PURCHASE",
      "change_qty": 10,
      "stock_before": 0,
      "stock_after": 10,
      "reason": "Stok awal saat pendaftaran barang",
      "created_at": "2026-10-13T05:40:50.594Z"
    },
    {
      "id": "mov_1791869094603_ax80",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "OUT_SALE",
      "change_qty": -2,
      "stock_before": 49,
      "stock_after": 47,
      "reference_no": "TRX-20261013-0002",
      "reason": "Penjualan Kasir Nota TRX-20261013-0002",
      "created_at": "2026-10-13T05:24:54.603Z"
    },
    {
      "id": "mov_1791869094603_wt1l",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "OUT_SALE",
      "change_qty": -2,
      "stock_before": 99,
      "stock_after": 97,
      "reference_no": "TRX-20261013-0002",
      "reason": "Penjualan Kasir Nota TRX-20261013-0002",
      "created_at": "2026-10-13T05:24:54.603Z"
    },
    {
      "id": "mov_1791868918443_wbf9",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 100,
      "stock_after": 99,
      "reference_no": "TRX-20261013-0001",
      "reason": "Penjualan Kasir Nota TRX-20261013-0001",
      "created_at": "2026-10-13T05:21:58.443Z"
    },
    {
      "id": "mov_1791868918443_fj7i",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "OUT_SALE",
      "change_qty": -1,
      "stock_before": 50,
      "stock_after": 49,
      "reference_no": "TRX-20261013-0001",
      "reason": "Penjualan Kasir Nota TRX-20261013-0001",
      "created_at": "2026-10-13T05:21:58.443Z"
    },
    {
      "id": "mov_1791868875932_1zww",
      "item_id": "item_1791868875932_7ti5",
      "item_code": "BRG-002",
      "item_name": "Bantu Uk. 10",
      "type": "IN_PURCHASE",
      "change_qty": 100,
      "stock_before": 0,
      "stock_after": 100,
      "reason": "Stok awal saat pendaftaran barang",
      "created_at": "2026-10-13T05:21:15.932Z"
    },
    {
      "id": "mov_1791868857271_w27w",
      "item_id": "item_1791868857271_png7",
      "item_code": "BRG-001",
      "item_name": "Oli Federal",
      "type": "IN_PURCHASE",
      "change_qty": 50,
      "stock_before": 0,
      "stock_after": 50,
      "reason": "Stok awal saat pendaftaran barang",
      "created_at": "2026-10-13T05:20:57.271Z"
    }
  ],
  "services": [
    {
      "id": "srv_1791868726545_2vjj",
      "name": "Service",
      "price": 45e3
    },
    {
      "id": "srv_1791868726622_zh5d",
      "name": "Service",
      "price": 45e3
    },
    {
      "id": "srv_1791868820531_zbvp",
      "name": "Ganti Oli Mesin",
      "price": 12e3,
      "category": "Pelumas"
    }
  ],
  "transactions": [
    {
      "id": "trx_1791955924752_h336",
      "invoice_no": "TRX-20261014-0002",
      "date": "2026-10-14T05:32:04.752Z",
      "items": [
        {
          "item_id": "item_1791868857271_png7",
          "item_code": "BRG-001",
          "item_name": "Oli Federal",
          "unit": "Botol",
          "cost_price": 5e4,
          "sell_price": 6e4,
          "qty": 1,
          "subtotal": 6e4
        },
        {
          "item_id": "item_1791870050594_u2er",
          "item_code": "BRG-003",
          "item_name": "spakboard supra",
          "unit": "Unit",
          "cost_price": 5e4,
          "sell_price": 75e3,
          "qty": 1,
          "subtotal": 75e3
        },
        {
          "item_id": "item_1791868875932_7ti5",
          "item_code": "BRG-002",
          "item_name": "Bantu Uk. 10",
          "unit": "Pcs",
          "cost_price": 5e3,
          "sell_price": 6e3,
          "qty": 1,
          "subtotal": 6e3
        }
      ],
      "services": [],
      "items_subtotal": 141e3,
      "services_subtotal": 0,
      "subtotal": 141e3,
      "discount": 0,
      "total_amount": 141e3,
      "payment_method": "TUNAI",
      "amount_received": 15e4,
      "change_amount": 9e3,
      "status": "CANCELLED",
      "created_at": "2026-10-14T05:32:04.752Z",
      "cancellation_reason": "batal",
      "cancelled_at": "2026-10-14T05:33:36.305Z"
    },
    {
      "id": "trx_1791951225614_vhlj",
      "invoice_no": "TRX-20261014-0001",
      "date": "2026-10-14T04:13:45.614Z",
      "items": [
        {
          "item_id": "item_1791868857271_png7",
          "item_code": "BRG-001",
          "item_name": "Oli Federal",
          "unit": "Botol",
          "cost_price": 5e4,
          "sell_price": 6e4,
          "qty": 1,
          "subtotal": 6e4
        },
        {
          "item_id": "item_1791868875932_7ti5",
          "item_code": "BRG-002",
          "item_name": "Bantu Uk. 10",
          "unit": "Pcs",
          "cost_price": 5e3,
          "sell_price": 6e3,
          "qty": 1,
          "subtotal": 6e3
        },
        {
          "item_id": "item_1791870050594_u2er",
          "item_code": "BRG-003",
          "item_name": "spakboard supra",
          "unit": "Unit",
          "cost_price": 5e4,
          "sell_price": 75e3,
          "qty": 1,
          "subtotal": 75e3
        }
      ],
      "services": [
        {
          "service_id": "srv_1791868726545_2vjj",
          "name": "Service",
          "price": 45e3,
          "qty": 1,
          "subtotal": 45e3
        }
      ],
      "items_subtotal": 141e3,
      "services_subtotal": 45e3,
      "subtotal": 186e3,
      "discount": 0,
      "total_amount": 186e3,
      "payment_method": "TUNAI",
      "amount_received": 2e5,
      "change_amount": 14e3,
      "status": "CANCELLED",
      "created_at": "2026-10-14T04:13:45.614Z",
      "cancellation_reason": "Tidak Jadi",
      "cancelled_at": "2026-10-14T04:27:05.516Z"
    },
    {
      "id": "trx_1791870132207_9s73",
      "invoice_no": "TRX-20261013-0004",
      "date": "2026-10-13T05:42:12.207Z",
      "items": [
        {
          "item_id": "item_1791868857271_png7",
          "item_code": "BRG-001",
          "item_name": "Oli Federal",
          "unit": "Botol",
          "cost_price": 5e4,
          "sell_price": 6e4,
          "qty": 1,
          "subtotal": 6e4
        },
        {
          "item_id": "item_1791868875932_7ti5",
          "item_code": "BRG-002",
          "item_name": "Bantu Uk. 10",
          "unit": "Pcs",
          "cost_price": 5e3,
          "sell_price": 6e3,
          "qty": 10,
          "subtotal": 6e4
        },
        {
          "item_id": "item_1791870050594_u2er",
          "item_code": "BRG-003",
          "item_name": "spakboard supra",
          "unit": "Unit",
          "cost_price": 5e4,
          "sell_price": 75e3,
          "qty": 1,
          "subtotal": 75e3
        }
      ],
      "services": [
        {
          "service_id": "srv_1791868726545_2vjj",
          "name": "Service",
          "price": 45e3,
          "qty": 1,
          "subtotal": 45e3
        }
      ],
      "items_subtotal": 195e3,
      "services_subtotal": 45e3,
      "subtotal": 24e4,
      "discount": 0,
      "total_amount": 24e4,
      "payment_method": "TUNAI",
      "amount_received": 3e5,
      "change_amount": 6e4,
      "status": "CANCELLED",
      "created_at": "2026-10-13T05:42:12.207Z",
      "cancellation_reason": "batal",
      "cancelled_at": "2026-10-14T05:33:56.505Z"
    },
    {
      "id": "trx_1791870074858_kbms",
      "invoice_no": "TRX-20261013-0003",
      "date": "2026-10-13T05:41:14.858Z",
      "items": [
        {
          "item_id": "item_1791868875932_7ti5",
          "item_code": "BRG-002",
          "item_name": "Bantu Uk. 10",
          "unit": "Pcs",
          "cost_price": 5e3,
          "sell_price": 6e3,
          "qty": 1,
          "subtotal": 6e3
        },
        {
          "item_id": "item_1791868857271_png7",
          "item_code": "BRG-001",
          "item_name": "Oli Federal",
          "unit": "Botol",
          "cost_price": 5e4,
          "sell_price": 6e4,
          "qty": 1,
          "subtotal": 6e4
        },
        {
          "item_id": "item_1791870050594_u2er",
          "item_code": "BRG-003",
          "item_name": "spakboard supra",
          "unit": "Unit",
          "cost_price": 5e4,
          "sell_price": 75e3,
          "qty": 1,
          "subtotal": 75e3
        }
      ],
      "services": [],
      "items_subtotal": 141e3,
      "services_subtotal": 0,
      "subtotal": 141e3,
      "discount": 0,
      "total_amount": 141e3,
      "payment_method": "TUNAI",
      "amount_received": 15e4,
      "change_amount": 9e3,
      "status": "CANCELLED",
      "created_at": "2026-10-13T05:41:14.858Z",
      "cancellation_reason": "batal",
      "cancelled_at": "2026-10-14T05:34:11.506Z"
    },
    {
      "id": "trx_1791869094603_0kup",
      "invoice_no": "TRX-20261013-0002",
      "date": "2026-10-13T05:24:54.603Z",
      "items": [
        {
          "item_id": "item_1791868875932_7ti5",
          "item_code": "BRG-002",
          "item_name": "Bantu Uk. 10",
          "unit": "Pcs",
          "cost_price": 5e3,
          "sell_price": 6e3,
          "qty": 2,
          "subtotal": 12e3
        },
        {
          "item_id": "item_1791868857271_png7",
          "item_code": "BRG-001",
          "item_name": "Oli Federal",
          "unit": "Botol",
          "cost_price": 5e4,
          "sell_price": 6e4,
          "qty": 2,
          "subtotal": 12e4
        }
      ],
      "services": [
        {
          "service_id": "srv_1791868726545_2vjj",
          "name": "Service",
          "price": 45e3,
          "qty": 1,
          "subtotal": 45e3
        },
        {
          "service_id": "srv_1791868820531_zbvp",
          "name": "Ganti Oli",
          "price": 1e4,
          "qty": 1,
          "subtotal": 1e4
        }
      ],
      "items_subtotal": 132e3,
      "services_subtotal": 55e3,
      "subtotal": 187e3,
      "discount": 0,
      "total_amount": 187e3,
      "payment_method": "TUNAI",
      "amount_received": 2e5,
      "change_amount": 13e3,
      "status": "CANCELLED",
      "created_at": "2026-10-13T05:24:54.603Z",
      "cancellation_reason": "dada",
      "cancelled_at": "2026-10-14T05:34:19.611Z"
    },
    {
      "id": "trx_1791868918443_0fwe",
      "invoice_no": "TRX-20261013-0001",
      "date": "2026-10-13T05:21:58.443Z",
      "customer_name": "jamhur",
      "vehicle_info": "Vario",
      "items": [
        {
          "item_id": "item_1791868857271_png7",
          "item_code": "BRG-001",
          "item_name": "Oli Federal",
          "unit": "Botol",
          "cost_price": 5e4,
          "sell_price": 6e4,
          "qty": 1,
          "subtotal": 6e4
        },
        {
          "item_id": "item_1791868875932_7ti5",
          "item_code": "BRG-002",
          "item_name": "Bantu Uk. 10",
          "unit": "Pcs",
          "cost_price": 5e3,
          "sell_price": 6e3,
          "qty": 1,
          "subtotal": 6e3
        }
      ],
      "services": [
        {
          "service_id": "srv_1791868726622_zh5d",
          "name": "Service",
          "price": 45e3,
          "qty": 1,
          "subtotal": 45e3
        }
      ],
      "items_subtotal": 66e3,
      "services_subtotal": 45e3,
      "subtotal": 111e3,
      "discount": 0,
      "total_amount": 111e3,
      "payment_method": "TUNAI",
      "amount_received": 2e5,
      "change_amount": 89e3,
      "status": "CANCELLED",
      "created_at": "2026-10-13T05:21:58.443Z",
      "cancellation_reason": "atata",
      "cancelled_at": "2026-10-14T05:34:15.786Z"
    }
  ],
  "expenses": [],
  "activity_logs": [
    {
      "id": "log_1791956056127_zt5w1",
      "timestamp": "2026-10-14T05:34:16.127Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791956055787_r4n8c",
      "timestamp": "2026-10-14T05:34:15.787Z",
      "action": "BATAL_TRANSAKSI",
      "details": "Transaksi dibatalkan: TRX-20261013-0001. Alasan: atata"
    },
    {
      "id": "log_1791956051856_qiwoi",
      "timestamp": "2026-10-14T05:34:11.857Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791956051507_3go6o",
      "timestamp": "2026-10-14T05:34:11.507Z",
      "action": "BATAL_TRANSAKSI",
      "details": "Transaksi dibatalkan: TRX-20261013-0003. Alasan: batal"
    },
    {
      "id": "log_1791956036708_xj5cb",
      "timestamp": "2026-10-14T05:33:56.708Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791956036505_hmso1",
      "timestamp": "2026-10-14T05:33:56.505Z",
      "action": "BATAL_TRANSAKSI",
      "details": "Transaksi dibatalkan: TRX-20261013-0004. Alasan: batal"
    },
    {
      "id": "log_1791956016648_xeinu",
      "timestamp": "2026-10-14T05:33:36.648Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791956016306_08ukh",
      "timestamp": "2026-10-14T05:33:36.306Z",
      "action": "BATAL_TRANSAKSI",
      "details": "Transaksi dibatalkan: TRX-20261014-0002. Alasan: batal"
    },
    {
      "id": "log_1791955998788_c72e3",
      "timestamp": "2026-10-14T05:33:18.788Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791955998428_uhgyh",
      "timestamp": "2026-10-14T05:33:18.428Z",
      "action": "TAMBAH_BARANG",
      "details": "Barang baru: [BRG-004] Shell"
    },
    {
      "id": "log_1791955925632_394uj",
      "timestamp": "2026-10-14T05:32:05.632Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791955924762_e1qhw",
      "timestamp": "2026-10-14T05:32:04.762Z",
      "action": "TRANSAKSI_SELESAI",
      "details": "Transaksi berhasil dibuat: TRX-20261014-0002 sebesar Rp 141.000"
    },
    {
      "id": "log_1791955613469_gy4m8",
      "timestamp": "2026-10-14T05:26:53.469Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791955613121_8ljl7",
      "timestamp": "2026-10-14T05:26:53.121Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791955602000_nq1wm",
      "timestamp": "2026-10-14T05:26:42.000Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791955601635_7noq8",
      "timestamp": "2026-10-14T05:26:41.635Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791955408716_oo4ox",
      "timestamp": "2026-10-14T05:23:28.716Z",
      "action": "SYNC_SUPABASE",
      "details": "Sinkronisasi menyeluruh ke Supabase cloud berhasil."
    },
    {
      "id": "log_1791952025517_oux1j",
      "timestamp": "2026-10-14T04:27:05.517Z",
      "action": "BATAL_TRANSAKSI",
      "details": "Transaksi dibatalkan: TRX-20261014-0001. Alasan: Tidak Jadi"
    },
    {
      "id": "log_1791951225621_zjp2u",
      "timestamp": "2026-10-14T04:13:45.622Z",
      "action": "TRANSAKSI_SELESAI",
      "details": "Transaksi berhasil dibuat: TRX-20261014-0001 sebesar Rp 186.000"
    },
    {
      "id": "log_1791870074858_jxgmm",
      "timestamp": "2026-10-13T05:41:14.858Z",
      "action": "TRANSAKSI_SELESAI",
      "details": "Transaksi berhasil dibuat: TRX-20261013-0003 sebesar Rp 141.000"
    },
    {
      "id": "log_1791870050595_ol6pf",
      "timestamp": "2026-10-13T05:40:50.595Z",
      "action": "TAMBAH_BARANG",
      "details": "Barang baru: [BRG-003] spakboard supra"
    },
    {
      "id": "log_1791869829460_qhjqi",
      "timestamp": "2026-10-13T05:37:09.460Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791869827813_wnthq",
      "timestamp": "2026-10-13T05:37:07.813Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791869788506_6nqgc",
      "timestamp": "2026-10-13T05:36:28.506Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791869394353_9v2b3",
      "timestamp": "2026-10-13T05:29:54.354Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791869393129_axksw",
      "timestamp": "2026-10-13T05:29:53.129Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791869387262_7vii2",
      "timestamp": "2026-10-13T05:29:47.262Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791869058747_58nsj",
      "timestamp": "2026-10-13T05:24:18.747Z",
      "action": "UBAH_PROFIL",
      "details": "Profil bengkel diperbarui: BENGKEL SUTIKNO"
    },
    {
      "id": "log_1791868918444_62c39",
      "timestamp": "2026-10-13T05:21:58.444Z",
      "action": "TRANSAKSI_SELESAI",
      "details": "Transaksi berhasil dibuat: TRX-20261013-0001 sebesar Rp 111.000"
    },
    {
      "id": "log_1791868875933_9hxx4",
      "timestamp": "2026-10-13T05:21:15.933Z",
      "action": "TAMBAH_BARANG",
      "details": "Barang baru: [BRG-002] Bantu Uk. 10"
    },
    {
      "id": "log_1791868857272_ophez",
      "timestamp": "2026-10-13T05:20:57.272Z",
      "action": "TAMBAH_BARANG",
      "details": "Barang baru: [BRG-001] Oli Federal"
    },
    {
      "id": "log_1791868820531_m72o2",
      "timestamp": "2026-10-13T05:20:20.531Z",
      "action": "TAMBAH_JASA",
      "details": "Jasa servis baru: Ganti Oli (Rp 10.000)"
    },
    {
      "id": "log_1791868726622_cgud7",
      "timestamp": "2026-10-13T05:18:46.622Z",
      "action": "TAMBAH_JASA",
      "details": "Jasa servis baru: Service (Rp 45.000)"
    },
    {
      "id": "log_1791868726555_7uh2w",
      "timestamp": "2026-10-13T05:18:46.555Z",
      "action": "TAMBAH_JASA",
      "details": "Jasa servis baru: Service (Rp 45.000)"
    }
  ]
};

// server/db.js
var isVercel = Boolean(process.env.VERCEL);
var DATA_DIR = isVercel ? "/tmp/data" : import_path.default.resolve(process.cwd(), "data");
var DB_FILE = import_path.default.resolve(DATA_DIR, "bengkel_database.json");
var defaultProfile = {
  name: "",
  tagline: "",
  address: "",
  phone: "",
  boss_whatsapp: "",
  logo_url: "",
  banner_url: "",
  stamp_config: {
    enabled: false,
    image_url: "",
    size: 85,
    position: "signature-overlap",
    opacity: 0.85,
    offset_x: 0,
    offset_y: 0
  },
  receipt_footer: "Terima kasih atas kunjungan Anda!",
  supabase_url: "",
  supabase_anon_key: "",
  updated_at: (/* @__PURE__ */ new Date()).toISOString()
};
var emptyDatabase = {
  profile: { ...defaultProfile },
  items: [],
  stock_movements: [],
  services: [],
  transactions: [],
  expenses: [],
  activity_logs: []
};
var BengkelDatabase = class {
  constructor() {
    this.supabase = null;
    this.ensureDataDir();
    if (isVercel && !import_fs.default.existsSync(DB_FILE)) {
      try {
        const seedFile = import_path.default.resolve(process.cwd(), "data", "bengkel_database.json");
        if (import_fs.default.existsSync(seedFile)) {
          import_fs.default.copyFileSync(seedFile, DB_FILE);
        }
      } catch (err) {
        console.warn("Gagal menyalin seed database ke /tmp:", err);
      }
    }
    this.data = this.loadDatabase();
    this.initSupabaseClient();
  }
  ensureDataDir() {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
  }
  loadDatabase() {
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          profile: { ...defaultProfile, ...parsed.profile || {} },
          items: Array.isArray(parsed.items) ? parsed.items : [],
          stock_movements: Array.isArray(parsed.stock_movements) ? parsed.stock_movements : [],
          services: Array.isArray(parsed.services) ? parsed.services : [],
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
          activity_logs: Array.isArray(parsed.activity_logs) ? parsed.activity_logs : []
        };
      }
    } catch (err) {
      console.error("Gagal membaca DB_FILE, mencoba fallback ke seed data:", err);
    }
    if (initialSeedData) {
      const parsed = initialSeedData;
      const initialDb = {
        profile: { ...defaultProfile, ...parsed.profile || {} },
        items: Array.isArray(parsed.items) ? parsed.items : [],
        stock_movements: Array.isArray(parsed.stock_movements) ? parsed.stock_movements : [],
        services: Array.isArray(parsed.services) ? parsed.services : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        activity_logs: Array.isArray(parsed.activity_logs) ? parsed.activity_logs : []
      };
      try {
        import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      } catch (writeErr) {
        console.warn("Gagal menulis initial DB_FILE ke disk:", writeErr);
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
      activity_logs: []
    };
  }
  saveDatabase() {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      const json = JSON.stringify(this.data, null, 2);
      import_fs.default.writeFileSync(tmpFile, json, "utf-8");
      import_fs.default.renameSync(tmpFile, DB_FILE);
      if (this.supabase) {
        this.syncAllToSupabase().catch((e) => console.warn("Supabase auto-sync notice:", e.message));
      }
    } catch (err) {
      console.error("Gagal menyimpan database ke disk:", err);
      throw new Error("Penyimpanan database gagal.");
    }
  }
  initSupabaseClient() {
    const url = process.env.SUPABASE_URL || this.data.profile.supabase_url;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || this.data.profile.supabase_anon_key;
    if (url && key && url.startsWith("http")) {
      try {
        this.supabase = (0, import_supabase_js.createClient)(url, key);
      } catch (e) {
        console.warn("Inisialisasi Supabase gagal:", e);
        this.supabase = null;
      }
    } else {
      this.supabase = null;
    }
  }
  getSupabaseStatus() {
    const url = process.env.SUPABASE_URL || this.data.profile.supabase_url || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || this.data.profile.supabase_anon_key || "";
    return {
      connected: !!(url && key && this.supabase),
      url: url ? url.replace(/^(https?:\/\/[^/]+).*/, "$1") : "",
      hasKey: !!key
    };
  }
  async testSupabaseConnection() {
    if (!this.supabase) {
      return { success: false, message: "Kredensial Supabase URL atau Key belum diisi atau tidak valid." };
    }
    try {
      const { error } = await this.supabase.from("items").select("id").limit(1);
      if (error) {
        return { success: false, message: `Koneksi Supabase gagal: ${error.message}. Pastikan skrip SQL sudah dijalankan di Supabase SQL Editor.` };
      }
      return { success: true, message: "Koneksi ke Supabase Cloud aktif & tabel terdeteksi!" };
    } catch (e) {
      return { success: false, message: `Error koneksi: ${e.message}` };
    }
  }
  async syncAllToSupabase() {
    if (!this.supabase) {
      return { success: false, message: "Supabase belum terhubung." };
    }
    try {
      const prof = this.data.profile;
      await this.supabase.from("workshop_profile").upsert({
        id: "default",
        name: prof.name || "",
        tagline: prof.tagline || "",
        address: prof.address || "",
        phone: prof.phone || "",
        boss_whatsapp: prof.boss_whatsapp || "",
        logo_url: prof.logo_url || "",
        banner_url: prof.banner_url || "",
        receipt_footer: prof.receipt_footer || "Terima kasih atas kunjungan Anda!",
        updated_at: prof.updated_at || (/* @__PURE__ */ new Date()).toISOString()
      });
      if (this.data.items.length > 0) {
        const itemRows = this.data.items.map((i) => ({
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
          updated_at: i.updated_at
        }));
        await this.supabase.from("items").upsert(itemRows);
      }
      if (this.data.services.length > 0) {
        const srvRows = this.data.services.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          description: s.description || "",
          created_at: s.created_at || (/* @__PURE__ */ new Date()).toISOString()
        }));
        await this.supabase.from("services").upsert(srvRows);
      }
      if (this.data.transactions.length > 0) {
        const trxRows = this.data.transactions.map((t) => ({
          id: t.id,
          invoice_no: t.invoice_no,
          date: t.date,
          customer_name: t.customer_name || "",
          customer_phone: t.customer_phone || "",
          vehicle_info: t.vehicle_info || "",
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
          notes: t.notes || "",
          created_at: t.created_at
        }));
        await this.supabase.from("transactions").upsert(trxRows);
      }
      if (this.data.expenses.length > 0) {
        const expRows = this.data.expenses.map((e) => ({
          id: e.id,
          date: e.date,
          category: e.category,
          description: e.description,
          amount: e.amount,
          receipt_note: e.receipt_note || "",
          created_at: e.created_at || (/* @__PURE__ */ new Date()).toISOString()
        }));
        await this.supabase.from("expenses").upsert(expRows);
      }
      this.logActivity("SYNC_SUPABASE", `Sinkronisasi menyeluruh ke Supabase cloud berhasil.`);
      return {
        success: true,
        message: `Berhasil menyinkronkan ${this.data.items.length} barang, ${this.data.services.length} jasa, dan ${this.data.transactions.length} transaksi ke Supabase Cloud!`,
        details: {
          items: this.data.items.length,
          services: this.data.services.length,
          transactions: this.data.transactions.length,
          expenses: this.data.expenses.length
        }
      };
    } catch (err) {
      console.error("Gagal sync ke Supabase:", err);
      return { success: false, message: `Gagal sinkronisasi: ${err.message}` };
    }
  }
  logActivity(action, details) {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      action,
      details
    };
    this.data.activity_logs.unshift(log);
    if (this.data.activity_logs.length > 500) {
      this.data.activity_logs.pop();
    }
  }
  // --- Profile & Settings ---
  getProfile() {
    return { ...this.data.profile };
  }
  updateProfile(updates) {
    this.data.profile = {
      ...this.data.profile,
      ...updates,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.saveDatabase();
    this.initSupabaseClient();
    this.logActivity("UBAH_PROFIL", `Profil bengkel diperbarui: ${this.data.profile.name || "(tanpa nama)"}`);
    return this.getProfile();
  }
  // --- Items / Stok Barang ---
  getItems(search, category) {
    let result = [...this.data.items];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
      );
    }
    if (category && category !== "Semua") {
      result = result.filter((item) => item.category === category);
    }
    return result;
  }
  getItemById(id) {
    return this.data.items.find((i) => i.id === id);
  }
  createItem(payload) {
    const code = payload.code.trim().toUpperCase();
    if (!code) throw new Error("Kode barang wajib diisi");
    if (!payload.name.trim()) throw new Error("Nama barang wajib diisi");
    if (this.data.items.some((i) => i.code === code)) {
      throw new Error(`Kode barang "${code}" sudah terdaftar`);
    }
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      code,
      name: payload.name.trim(),
      category: payload.category || "Umum",
      unit: payload.unit || "Pcs",
      cost_price: Math.max(0, Math.round(Number(payload.cost_price) || 0)),
      sell_price: Math.max(0, Math.round(Number(payload.sell_price) || 0)),
      stock: Math.max(0, Math.round(Number(payload.stock) || 0)),
      min_stock: Math.max(0, Math.round(Number(payload.min_stock) || 0)),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.items.push(newItem);
    if (newItem.stock > 0) {
      this.data.stock_movements.unshift({
        id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        item_id: newItem.id,
        item_code: newItem.code,
        item_name: newItem.name,
        type: "IN_PURCHASE",
        change_qty: newItem.stock,
        stock_before: 0,
        stock_after: newItem.stock,
        reason: "Stok awal saat pendaftaran barang",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    this.saveDatabase();
    this.logActivity("TAMBAH_BARANG", `Barang baru: [${newItem.code}] ${newItem.name}`);
    return newItem;
  }
  updateItem(id, payload) {
    const item = this.getItemById(id);
    if (!item) throw new Error("Barang tidak ditemukan");
    if (payload.code && payload.code.trim().toUpperCase() !== item.code) {
      const code = payload.code.trim().toUpperCase();
      if (this.data.items.some((i) => i.id !== id && i.code === code)) {
        throw new Error(`Kode barang "${code}" sudah digunakan oleh barang lain`);
      }
      item.code = code;
    }
    if (payload.name !== void 0) item.name = payload.name.trim();
    if (payload.category !== void 0) item.category = payload.category.trim();
    if (payload.unit !== void 0) item.unit = payload.unit.trim();
    if (payload.cost_price !== void 0) item.cost_price = Math.max(0, Math.round(Number(payload.cost_price)));
    if (payload.sell_price !== void 0) item.sell_price = Math.max(0, Math.round(Number(payload.sell_price)));
    if (payload.min_stock !== void 0) item.min_stock = Math.max(0, Math.round(Number(payload.min_stock)));
    item.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    this.saveDatabase();
    this.logActivity("UBAH_BARANG", `Ubah informasi barang: [${item.code}] ${item.name}`);
    return item;
  }
  deleteItem(id) {
    const idx = this.data.items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Barang tidak ditemukan");
    const target = this.data.items[idx];
    this.data.items.splice(idx, 1);
    this.saveDatabase();
    if (this.supabase) {
      this.supabase.from("items").delete().eq("id", id).then(({ error }) => {
        if (error) console.error("Gagal menghapus item dari Supabase:", error.message);
      }).catch((err) => console.error("Supabase delete item err:", err));
    }
    this.logActivity("HAPUS_BARANG", `Barang dihapus dari katalog: [${target.code}] ${target.name}`);
    return {
      success: true,
      message: `Barang "${target.name}" (${target.code}) berhasil dihapus.`
    };
  }
  adjustStock(payload) {
    const item = this.getItemById(payload.item_id);
    if (!item) throw new Error("Barang tidak ditemukan");
    const qty = Math.round(Number(payload.quantity));
    if (isNaN(qty) || qty === 0) throw new Error("Jumlah perubahan stok harus berupa angka bukan nol");
    if (!payload.reason || !payload.reason.trim()) throw new Error("Alasan perubahan stok wajib diisi");
    const stockBefore = item.stock;
    let stockAfter = stockBefore;
    if (payload.type === "IN_PURCHASE") {
      if (qty < 0) throw new Error("Jumlah stok masuk harus positif");
      stockAfter = stockBefore + qty;
    } else if (payload.type === "OUT_SALE") {
      if (qty < 0) throw new Error("Jumlah stok keluar harus positif");
      if (stockBefore < qty) {
        throw new Error(`Stok tidak mencukupi (tersedia: ${stockBefore}, diminta keluar: ${qty})`);
      }
      stockAfter = stockBefore - qty;
    } else {
      stockAfter = stockBefore + qty;
      if (stockAfter < 0) {
        throw new Error(`Penyesuaian menyebabkan stok menjadi negatif (${stockAfter}). Operasi dibatalkan.`);
      }
    }
    item.stock = stockAfter;
    item.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    const movement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      item_id: item.id,
      item_code: item.code,
      item_name: item.name,
      type: payload.type,
      change_qty: payload.type === "OUT_SALE" ? -Math.abs(qty) : payload.type === "IN_PURCHASE" ? Math.abs(qty) : qty,
      stock_before: stockBefore,
      stock_after: stockAfter,
      reference_no: payload.reference_no,
      reason: payload.reason.trim(),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.stock_movements.unshift(movement);
    if (payload.type === "IN_PURCHASE" && payload.record_expense) {
      const unitCost = payload.cost_per_unit ?? item.cost_price;
      const totalCost = unitCost * qty;
      if (totalCost > 0) {
        this.data.expenses.unshift({
          id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          category: "PEMBELIAN_STOK",
          description: `Pembelian persediaan [${item.code}] ${item.name} (${qty} ${item.unit})`,
          amount: totalCost,
          receipt_note: payload.reference_no,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    this.saveDatabase();
    this.logActivity("PENYESUAIAN_STOK", `Stok [${item.code}] ${item.name} berubah dari ${stockBefore} menjadi ${stockAfter}. Alasan: ${payload.reason}`);
    return { item, movement };
  }
  getStockMovements(itemId) {
    if (itemId) {
      return this.data.stock_movements.filter((m) => m.item_id === itemId);
    }
    return [...this.data.stock_movements];
  }
  // --- Services / Jasa Servis ---
  getServices(includeInactive = false) {
    if (includeInactive) {
      return [...this.data.services];
    }
    return this.data.services.filter((s) => s.is_active !== false);
  }
  createService(payload) {
    if (!payload.name.trim()) throw new Error("Nama jasa servis wajib diisi");
    const newService = {
      id: `srv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: payload.name.trim(),
      price: Math.max(0, Math.round(Number(payload.price) || 0)),
      category: payload.category?.trim() || "Servis & Perawatan",
      description: payload.description?.trim(),
      is_active: true
    };
    this.data.services.push(newService);
    this.saveDatabase();
    this.logActivity("TAMBAH_JASA", `Jasa servis baru: ${newService.name} (Rp ${newService.price.toLocaleString("id-ID")})`);
    return newService;
  }
  updateService(id, payload) {
    const service = this.data.services.find((s) => s.id === id);
    if (!service) throw new Error("Jasa servis tidak ditemukan");
    if (payload.name !== void 0) {
      if (!payload.name.trim()) throw new Error("Nama jasa servis tidak boleh kosong");
      service.name = payload.name.trim();
    }
    if (payload.price !== void 0) {
      service.price = Math.max(0, Math.round(Number(payload.price) || 0));
    }
    if (payload.category !== void 0) {
      service.category = payload.category.trim();
    }
    if (payload.description !== void 0) {
      service.description = payload.description.trim();
    }
    if (payload.is_active !== void 0) {
      service.is_active = payload.is_active;
    }
    this.saveDatabase();
    this.logActivity("UBAH_JASA", `Jasa servis diubah: ${service.name} (Rp ${service.price.toLocaleString("id-ID")})`);
    return service;
  }
  deleteService(id) {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Jasa servis tidak ditemukan");
    const target = this.data.services[idx];
    const isUsedInTransactions = this.data.transactions.some(
      (t) => t.services && t.services.some((s) => s.service_id === id || s.name.toLowerCase() === target.name.toLowerCase())
    );
    if (isUsedInTransactions) {
      target.is_active = false;
      this.saveDatabase();
      this.logActivity("ARSIP_JASA", `Jasa servis diarsipkan karena telah digunakan dalam transaksi: ${target.name}`);
      return {
        success: true,
        archived: true,
        message: "Jasa dinonaktifkan / diarsipkan karena sudah tercatat dalam riwayat transaksi sebelumnya."
      };
    } else {
      this.data.services.splice(idx, 1);
      this.saveDatabase();
      this.logActivity("HAPUS_JASA", `Jasa servis dihapus permanen: ${target.name}`);
      return {
        success: true,
        archived: false,
        message: "Jasa servis berhasil dihapus."
      };
    }
  }
  // --- Transactions / Kasir ---
  getTransactions(limit = 100) {
    return [...this.data.transactions].slice(0, limit);
  }
  getTransactionById(id) {
    return this.data.transactions.find((t) => t.id === id || t.invoice_no === id);
  }
  generateInvoiceNumber() {
    const now = /* @__PURE__ */ new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const prefix = `TRX-${yyyy}${mm}${dd}`;
    const todayCount = this.data.transactions.filter((t) => t.invoice_no.startsWith(prefix)).length + 1;
    const seq = String(todayCount).padStart(4, "0");
    return `${prefix}-${seq}`;
  }
  /**
   * Atomic Transaction Creation:
   * Validates stock availability, deducts stock, creates stock movements,
   * generates unique invoice, records transaction. Everything commits atomically!
   */
  createTransaction(payload) {
    if ((!payload.items || payload.items.length === 0) && (!payload.services || payload.services.length === 0)) {
      throw new Error("Transaksi harus memiliki minimal 1 barang atau jasa servis");
    }
    const resolvedItems = [];
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
          subtotal: item.sell_price * qty
        });
      }
    }
    const resolvedServices = [];
    if (payload.services && payload.services.length > 0) {
      for (const srv of payload.services) {
        const name = srv.name.trim();
        if (!name) throw new Error("Nama jasa servis tidak boleh kosong");
        const price = Math.max(0, Math.round(Number(srv.price) || 0));
        const qty = Math.max(1, Math.round(Number(srv.qty) || 1));
        resolvedServices.push({
          service_id: srv.service_id,
          name,
          price,
          qty,
          subtotal: price * qty
        });
      }
    }
    const itemsSubtotal = resolvedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const servicesSubtotal = resolvedServices.reduce((acc, curr) => acc + curr.subtotal, 0);
    const grossSubtotal = itemsSubtotal + servicesSubtotal;
    const discount = Math.max(0, Math.min(grossSubtotal, Math.round(Number(payload.discount) || 0)));
    const totalAmount = grossSubtotal - discount;
    const amountReceived = Math.max(0, Math.round(Number(payload.amount_received) || 0));
    if (payload.payment_method === "TUNAI" && amountReceived < totalAmount) {
      throw new Error(
        `Uang diterima (Rp ${amountReceived.toLocaleString("id-ID")}) kurang dari total pembayaran (Rp ${totalAmount.toLocaleString("id-ID")})`
      );
    }
    const changeAmount = payload.payment_method === "TUNAI" ? Math.max(0, amountReceived - totalAmount) : 0;
    const invoiceNo = this.generateInvoiceNumber();
    const transactionId = `trx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    for (const res of resolvedItems) {
      const stockBefore = res.item.stock;
      res.item.stock = stockBefore - res.qty;
      res.item.updated_at = nowIso;
      this.data.stock_movements.unshift({
        id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        item_id: res.item.id,
        item_code: res.item.code,
        item_name: res.item.name,
        type: "OUT_SALE",
        change_qty: -res.qty,
        stock_before: stockBefore,
        stock_after: res.item.stock,
        reference_no: invoiceNo,
        reason: `Penjualan Kasir Nota ${invoiceNo}`,
        created_at: nowIso
      });
    }
    const transaction = {
      id: transactionId,
      invoice_no: invoiceNo,
      date: nowIso,
      customer_name: payload.customer_name?.trim() || void 0,
      customer_phone: payload.customer_phone?.trim() || void 0,
      vehicle_info: payload.vehicle_info?.trim() || void 0,
      items: resolvedItems.map((r) => ({
        item_id: r.item.id,
        item_code: r.item.code,
        item_name: r.item.name,
        unit: r.item.unit,
        cost_price: r.unitCost,
        sell_price: r.unitSell,
        qty: r.qty,
        subtotal: r.subtotal
      })),
      services: resolvedServices,
      items_subtotal: itemsSubtotal,
      services_subtotal: servicesSubtotal,
      subtotal: grossSubtotal,
      discount,
      total_amount: totalAmount,
      payment_method: payload.payment_method,
      amount_received: payload.payment_method === "TUNAI" ? amountReceived : totalAmount,
      change_amount: changeAmount,
      status: "COMPLETED",
      notes: payload.notes?.trim() || void 0,
      created_at: nowIso
    };
    this.data.transactions.unshift(transaction);
    this.saveDatabase();
    this.logActivity("TRANSAKSI_SELESAI", `Transaksi berhasil dibuat: ${invoiceNo} sebesar Rp ${totalAmount.toLocaleString("id-ID")}`);
    return transaction;
  }
  /**
   * Cancel Transaction with atomic stock reversion
   */
  cancelTransaction(id, reason) {
    const trx = this.data.transactions.find((t) => t.id === id || t.invoice_no === id);
    if (!trx) throw new Error("Transaksi tidak ditemukan");
    if (trx.status === "CANCELLED") throw new Error("Transaksi sudah dibatalkan sebelumnya");
    if (!reason || !reason.trim()) throw new Error("Alasan pembatalan wajib diisi");
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
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
          type: "RETURN_CANCEL",
          change_qty: trxItem.qty,
          stock_before: stockBefore,
          stock_after: item.stock,
          reference_no: trx.invoice_no,
          reason: `Pengembalian stok pembatalan transaksi ${trx.invoice_no}: ${reason.trim()}`,
          created_at: nowIso
        });
      }
    }
    trx.status = "CANCELLED";
    trx.cancellation_reason = reason.trim();
    trx.cancelled_at = nowIso;
    this.saveDatabase();
    this.logActivity("BATAL_TRANSAKSI", `Transaksi dibatalkan: ${trx.invoice_no}. Alasan: ${reason}`);
    return trx;
  }
  /**
   * Update / Edit saved transaction with atomic stock recalculation and synchronization
   */
  updateTransaction(id, payload) {
    const trx = this.data.transactions.find((t) => t.id === id || t.invoice_no === id);
    if (!trx) throw new Error("Nota transaksi tidak ditemukan.");
    if (trx.status === "CANCELLED") throw new Error("Nota yang sudah dibatalkan tidak dapat diedit.");
    if ((!payload.items || payload.items.length === 0) && (!payload.services || payload.services.length === 0)) {
      throw new Error("Transaksi harus memiliki minimal 1 barang atau jasa servis");
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const itemStockMap = /* @__PURE__ */ new Map();
    for (const oldItem of trx.items) {
      const dbItem = this.getItemById(oldItem.item_id);
      if (dbItem) {
        itemStockMap.set(dbItem.id, (itemStockMap.get(dbItem.id) ?? dbItem.stock) + oldItem.qty);
      }
    }
    const resolvedItems = [];
    for (const reqItem of payload.items) {
      const dbItem = this.getItemById(reqItem.item_id);
      if (!dbItem) throw new Error(`Barang dengan ID ${reqItem.item_id} tidak ditemukan.`);
      const qty = Math.round(Number(reqItem.qty));
      if (qty <= 0) throw new Error(`Jumlah untuk ${dbItem.name} harus lebih dari 0.`);
      const availableStock = itemStockMap.has(dbItem.id) ? itemStockMap.get(dbItem.id) : dbItem.stock;
      if (availableStock < qty) {
        throw new Error(
          `Stok tidak mencukupi untuk "${dbItem.name}". Stok tersedia: ${availableStock}, diminta: ${qty}.`
        );
      }
      itemStockMap.set(dbItem.id, availableStock - qty);
      const unitSell = reqItem.sell_price !== void 0 && reqItem.sell_price >= 0 ? Math.round(reqItem.sell_price) : dbItem.sell_price;
      const unitCost = dbItem.cost_price;
      resolvedItems.push({
        item: dbItem,
        qty,
        unitCost,
        unitSell,
        subtotal: unitSell * qty
      });
    }
    const resolvedServices = [];
    if (payload.services && payload.services.length > 0) {
      for (const srv of payload.services) {
        const name = srv.name?.trim();
        if (!name) throw new Error("Nama jasa servis tidak boleh kosong");
        const price = Math.max(0, Math.round(Number(srv.price) || 0));
        const qty = Math.max(1, Math.round(Number(srv.qty) || 1));
        resolvedServices.push({
          service_id: srv.service_id,
          name,
          price,
          qty,
          subtotal: price * qty
        });
      }
    }
    const itemsSubtotal = resolvedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const servicesSubtotal = resolvedServices.reduce((acc, curr) => acc + curr.subtotal, 0);
    const grossSubtotal = itemsSubtotal + servicesSubtotal;
    const discount = Math.max(0, Math.min(grossSubtotal, Math.round(Number(payload.discount) || 0)));
    const totalAmount = grossSubtotal - discount;
    const paymentMethod = payload.payment_method || trx.payment_method;
    const amountReceived = payload.amount_received !== void 0 ? Math.max(0, Math.round(Number(payload.amount_received) || 0)) : paymentMethod === "TUNAI" ? Math.max(totalAmount, trx.amount_received) : totalAmount;
    if (paymentMethod === "TUNAI" && amountReceived < totalAmount) {
      throw new Error(
        `Uang diterima (Rp ${amountReceived.toLocaleString("id-ID")}) kurang dari total pembayaran (Rp ${totalAmount.toLocaleString("id-ID")})`
      );
    }
    const changeAmount = paymentMethod === "TUNAI" ? Math.max(0, amountReceived - totalAmount) : 0;
    for (const oldItem of trx.items) {
      const dbItem = this.getItemById(oldItem.item_id);
      if (dbItem) {
        dbItem.stock += oldItem.qty;
        dbItem.updated_at = nowIso;
      }
    }
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
        type: "ADJUSTMENT",
        change_qty: -newItem.qty,
        stock_before: stockBefore,
        stock_after: dbItem.stock,
        reference_no: trx.invoice_no,
        reason: `Revisi Nota ${trx.invoice_no}: penyesuaian stok baru ${newItem.qty} ${dbItem.unit}`,
        created_at: nowIso
      });
    }
    trx.customer_name = payload.customer_name?.trim() || void 0;
    trx.customer_phone = payload.customer_phone?.trim() || void 0;
    trx.vehicle_info = payload.vehicle_info?.trim() || void 0;
    trx.notes = payload.notes?.trim() || void 0;
    trx.items = resolvedItems.map((r) => ({
      item_id: r.item.id,
      item_code: r.item.code,
      item_name: r.item.name,
      unit: r.item.unit,
      cost_price: r.unitCost,
      sell_price: r.unitSell,
      qty: r.qty,
      subtotal: r.subtotal
    }));
    trx.services = resolvedServices;
    trx.items_subtotal = itemsSubtotal;
    trx.services_subtotal = servicesSubtotal;
    trx.subtotal = grossSubtotal;
    trx.discount = discount;
    trx.total_amount = totalAmount;
    trx.payment_method = paymentMethod;
    trx.amount_received = paymentMethod === "TUNAI" ? amountReceived : totalAmount;
    trx.change_amount = changeAmount;
    this.saveDatabase();
    this.logActivity("EDIT_TRANSAKSI", `Nota ${trx.invoice_no} diperbarui. Total baru Rp ${totalAmount.toLocaleString("id-ID")}`);
    return trx;
  }
  // --- Expenses / Pengeluaran ---
  getExpenses() {
    return [...this.data.expenses];
  }
  createExpense(payload) {
    if (!payload.description.trim()) throw new Error("Keterangan pengeluaran wajib diisi");
    const amount = Math.max(0, Math.round(Number(payload.amount) || 0));
    if (amount <= 0) throw new Error("Nominal pengeluaran harus lebih besar dari 0");
    const newExpense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: payload.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      category: payload.category || "OPERASIONAL",
      description: payload.description.trim(),
      amount,
      receipt_note: payload.receipt_note?.trim(),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.expenses.unshift(newExpense);
    this.saveDatabase();
    this.logActivity("TAMBAH_PENGELUARAN", `Pengeluaran [${newExpense.category}]: ${newExpense.description} (Rp ${amount.toLocaleString("id-ID")})`);
    return newExpense;
  }
  deleteExpense(id) {
    const idx = this.data.expenses.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const removed = this.data.expenses.splice(idx, 1)[0];
      this.saveDatabase();
      this.logActivity("HAPUS_PENGELUARAN", `Pengeluaran dihapus: ${removed.description}`);
    }
  }
  // --- Activity Logs ---
  getActivityLogs(limit = 100) {
    return this.data.activity_logs.slice(0, limit);
  }
  // --- Dashboard Aggregations (Calculated strictly from database) ---
  getDashboardStats() {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const completedTrx = this.data.transactions.filter((t) => t.status === "COMPLETED");
    const todayTrx = completedTrx.filter((t) => t.date.startsWith(todayStr));
    const todayRevenue = todayTrx.reduce((sum, t) => sum + t.total_amount, 0);
    const totalIncome = completedTrx.reduce((sum, t) => sum + t.total_amount, 0);
    let totalCogs = 0;
    for (const trx of completedTrx) {
      for (const it of trx.items) {
        totalCogs += (it.cost_price || 0) * it.qty;
      }
    }
    const operationalExpenses = this.data.expenses.filter((e) => e.category !== "PEMBELIAN_STOK").reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = totalIncome - totalCogs;
    const netProfit = grossProfit - operationalExpenses;
    const lowStockItems = this.data.items.filter((item) => item.stock <= item.min_stock);
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
      recent_transactions: completedTrx.slice(0, 10)
    };
  }
  // --- Financial Report Summary ---
  getFinancialReport(startDate, endDate) {
    const completedTrx = this.data.transactions.filter((t) => {
      if (t.status !== "COMPLETED") return false;
      const tDate = t.date.split("T")[0];
      if (startDate && tDate < startDate) return false;
      if (endDate && tDate > endDate) return false;
      return true;
    });
    const filteredExpenses = this.data.expenses.filter((e) => {
      const eDate = e.date.split("T")[0];
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
    const inventoryPurchases = filteredExpenses.filter((e) => e.category === "PEMBELIAN_STOK").reduce((sum, e) => sum + e.amount, 0);
    const operationalExpenses = filteredExpenses.filter((e) => e.category !== "PEMBELIAN_STOK").reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = operationalExpenses + inventoryPurchases;
    const netProfit = grossProfit - operationalExpenses;
    let periodLabel = "Semua Waktu";
    if (startDate && endDate) {
      periodLabel = startDate === endDate ? `Tanggal ${startDate}` : `${startDate} s/d ${endDate}`;
    } else if (startDate) {
      periodLabel = `Sejak ${startDate}`;
    } else if (endDate) {
      periodLabel = `Hingga ${endDate}`;
    }
    const cancelledCount = this.data.transactions.filter((t) => {
      if (t.status !== "CANCELLED") return false;
      const tDate = t.date.split("T")[0];
      if (startDate && tDate < startDate) return false;
      if (endDate && tDate > endDate) return false;
      return true;
    }).length;
    return {
      period_label: periodLabel,
      start_date: startDate || "",
      end_date: endDate || "",
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
      expenses: filteredExpenses
    };
  }
  // --- Backup & Restore ---
  exportBackup() {
    return {
      version: "1.0.0",
      exported_at: (/* @__PURE__ */ new Date()).toISOString(),
      profile: this.data.profile,
      items: this.data.items,
      stock_movements: this.data.stock_movements,
      services: this.data.services,
      transactions: this.data.transactions,
      expenses: this.data.expenses,
      activity_logs: this.data.activity_logs
    };
  }
  importBackup(backup) {
    if (!backup || typeof backup !== "object") {
      throw new Error("Format file backup tidak valid");
    }
    if (!Array.isArray(backup.items) && !Array.isArray(backup.transactions)) {
      throw new Error("File backup tidak memiliki struktur data bengkel yang sesuai");
    }
    this.data = {
      profile: backup.profile ? { ...defaultProfile, ...backup.profile } : this.data.profile,
      items: Array.isArray(backup.items) ? backup.items : [],
      stock_movements: Array.isArray(backup.stock_movements) ? backup.stock_movements : [],
      services: Array.isArray(backup.services) ? backup.services : [],
      transactions: Array.isArray(backup.transactions) ? backup.transactions : [],
      expenses: Array.isArray(backup.expenses) ? backup.expenses : [],
      activity_logs: Array.isArray(backup.activity_logs) ? backup.activity_logs : []
    };
    this.saveDatabase();
    this.logActivity("RESTORE_DATA", `Pemulihan data cadangan berhasil dilakukan.`);
    return { success: true, message: "Data cadangan berhasil dipulihkan." };
  }
  // --- SQL Schema generator for Supabase migration ---
  getSupabaseSqlSchema() {
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
};
var db = new BengkelDatabase();

// server.ts
var import_meta = {};
import_dotenv.default.config();
var appDir = process.cwd();
try {
  if (typeof import_meta !== "undefined" && import_meta.url) {
    appDir = import_path2.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
  }
} catch {
  appDir = process.cwd();
}
var __dirname = appDir;
var app = (0, import_express.default)();
var httpServer = import_http.default.createServer(app);
var PORT = process.env.PORT || 3e3;
app.use(import_express.default.json({ limit: "15mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "15mb" }));
var isVercel2 = Boolean(process.env.VERCEL);
var UPLOAD_DIR = isVercel2 ? import_path2.default.resolve("/tmp", "uploads") : import_path2.default.resolve(process.cwd(), "data", "uploads");
if (!import_fs2.default.existsSync(UPLOAD_DIR)) {
  try {
    import_fs2.default.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    console.warn("Gagal membuat direktori upload:", e);
  }
}
app.use("/uploads", import_express.default.static(UPLOAD_DIR));
app.use("/api/uploads", import_express.default.static(UPLOAD_DIR));
app.use((req, _res, next) => {
  const headerPath = req.headers["x-matched-path"] || req.headers["x-vercel-sc-path"] || req.headers["x-original-url"] || req.headers["x-forwarded-uri"] || req.headers["x-rewrite-url"];
  if (headerPath && headerPath.startsWith("/api") && (req.url === "/api" || req.url === "/api/")) {
    req.url = headerPath;
  }
  const urlPath = req.url.split("?")[0];
  if (!urlPath.startsWith("/api") && !urlPath.startsWith("/uploads")) {
    const isApiRoute = [
      "/profile",
      "/upload",
      "/items",
      "/movements",
      "/services",
      "/transactions",
      "/expenses",
      "/dashboard",
      "/reports",
      "/whatsapp",
      "/backup",
      "/database",
      "/logs"
    ].some((prefix) => urlPath === prefix || urlPath.startsWith(prefix + "/"));
    if (isApiRoute) {
      req.url = "/api" + req.url;
    }
  }
  next();
});
app.get("/api/profile", (req, res) => {
  try {
    const profile = db.getProfile();
    const dbStatus = db.getSupabaseStatus();
    res.json({ profile, dbStatus });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengambil data profil" });
  }
});
app.put("/api/profile", (req, res) => {
  try {
    const updated = db.updateProfile(req.body);
    res.json({ success: true, profile: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal memperbarui profil" });
  }
});
app.post("/api/upload", (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Data gambar wajib disertakan" });
    }
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Format base64 tidak valid" });
    }
    const ext = matches[1].split("/")[1] || "png";
    const buffer = Buffer.from(matches[2], "base64");
    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = import_path2.default.join(UPLOAD_DIR, safeName);
    import_fs2.default.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeName}`;
    res.json({ success: true, url: publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengunggah gambar" });
  }
});
app.get("/api/items", (req, res) => {
  try {
    const search = req.query.search;
    const category = req.query.category;
    const items = db.getItems(search, category);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengambil daftar barang" });
  }
});
app.post("/api/items", (req, res) => {
  try {
    const item = db.createItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal menambahkan barang" });
  }
});
app.put("/api/items/:id", (req, res) => {
  try {
    const updated = db.updateItem(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal mengubah barang" });
  }
});
app.delete("/api/items/:id", (req, res) => {
  try {
    const result = db.deleteItem(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal menghapus barang" });
  }
});
app.post("/api/items/:id/stock", (req, res) => {
  try {
    const result = db.adjustStock({
      item_id: req.params.id,
      ...req.body
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal memperbarui stok" });
  }
});
app.get("/api/movements", (req, res) => {
  try {
    const itemId = req.query.itemId;
    const movements = db.getStockMovements(itemId);
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengambil riwayat pergerakan stok" });
  }
});
app.get("/api/services", (req, res) => {
  try {
    const includeInactive = req.query.all === "true";
    const services = db.getServices(includeInactive);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengambil daftar jasa servis" });
  }
});
app.post("/api/services", (req, res) => {
  try {
    const service = db.createService(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal menambahkan jasa servis" });
  }
});
app.put("/api/services/:id", (req, res) => {
  try {
    const updated = db.updateService(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal memperbarui jasa servis" });
  }
});
app.delete("/api/services/:id", (req, res) => {
  try {
    const result = db.deleteService(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal menghapus jasa servis" });
  }
});
app.get("/api/transactions", (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    const transactions = db.getTransactions(limit);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengambil riwayat transaksi" });
  }
});
app.get("/api/transactions/:id", (req, res) => {
  try {
    const trx = db.getTransactionById(req.params.id);
    if (!trx) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    res.json(trx);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengambil detail transaksi" });
  }
});
app.post("/api/transactions", (req, res) => {
  try {
    const transaction = db.createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message || "Penyimpanan transaksi gagal" });
  }
});
app.post("/api/transactions/:id/cancel", (req, res) => {
  try {
    const { reason } = req.body;
    const cancelled = db.cancelTransaction(req.params.id, reason);
    res.json(cancelled);
  } catch (err) {
    res.status(400).json({ error: err.message || "Pembatalan transaksi gagal" });
  }
});
app.put("/api/transactions/:id", (req, res) => {
  try {
    const updated = db.updateTransaction(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Pembaruan nota transaksi gagal" });
  }
});
app.get("/api/expenses", (req, res) => {
  try {
    const expenses = db.getExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengambil daftar pengeluaran" });
  }
});
app.post("/api/expenses", (req, res) => {
  try {
    const expense = db.createExpense(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal mencatat pengeluaran" });
  }
});
app.delete("/api/expenses/:id", (req, res) => {
  try {
    db.deleteExpense(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal menghapus pengeluaran" });
  }
});
app.get("/api/dashboard", (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal mengambil statistik dashboard" });
  }
});
app.get("/api/reports", (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const report = db.getFinancialReport(startDate, endDate);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal membuat laporan keuangan" });
  }
});
app.get("/api/whatsapp/preview", (req, res) => {
  try {
    const period = req.query.period || "today";
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let startDate = today;
    let endDate = today;
    if (period === "weekly") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split("T")[0];
    } else if (period === "monthly") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(1);
      startDate = d.toISOString().split("T")[0];
    } else if (period === "custom") {
      startDate = req.query.startDate || today;
      endDate = req.query.endDate || today;
    }
    const report = db.getFinancialReport(startDate, endDate);
    const profile = db.getProfile();
    const workshopName = profile.name || "Bengkel";
    const bossNumber = profile.boss_whatsapp?.replace(/[^0-9]/g, "") || "";
    const formatIdr = (n) => `Rp ${n.toLocaleString("id-ID")}`;
    const text = `*LAPORAN OPERASIONAL BENGKEL*
----------------------------------------
*Nama Bengkel:* ${workshopName}
*Periode:* ${report.period_label}
*Waktu Cetak:* ${(/* @__PURE__ */ new Date()).toLocaleString("id-ID")}

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
    const waUrl = bossNumber ? `https://wa.me/${bossNumber}?text=${encodedText}` : "";
    res.json({
      boss_whatsapp: bossNumber,
      message_text: text,
      whatsapp_url: waUrl,
      report
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal menyiapkan laporan WhatsApp" });
  }
});
app.get("/api/backup/export", (req, res) => {
  try {
    const backup = db.exportBackup();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=bengkelpro-backup-${Date.now()}.json`);
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal membuat cadangan database" });
  }
});
app.post("/api/backup/restore", (req, res) => {
  try {
    const result = db.importBackup(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Gagal memulihkan database" });
  }
});
app.get("/api/database/status", (req, res) => {
  try {
    res.json(db.getSupabaseStatus());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/database/test", async (req, res) => {
  try {
    const result = await db.testSupabaseConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/database/sync", async (req, res) => {
  try {
    const result = await db.syncAllToSupabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/database/schema-sql", (req, res) => {
  try {
    res.json({ sql: db.getSupabaseSqlSchema() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/logs", (req, res) => {
  try {
    res.json(db.getActivityLogs(50));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(import_express.default.static(import_path2.default.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
          overlay: false
        }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`BengkelPro Server berjalan pada port ${PORT} (http://0.0.0.0:${PORT})`);
  });
}
var isVercelEnv = Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.VERCEL_ENV);
var isDirectExecution = !process.argv[1] || process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js") || process.argv[1].includes("tsx");
if (!isVercelEnv && isDirectExecution) {
  startServer().catch((err) => {
    console.error("Gagal menjalankan server:", err);
    process.exit(1);
  });
}
var server_default = app;
