# Alvian Heating – Data Penjualan

Aplikasi web (PWA) untuk mencari dan menganalisa data penjualan Alvian Heating. Data diambil dari foto faktur yang dibaca otomatis oleh AI (Gemini), disimpan di Google Sheets, lalu ditampilkan di aplikasi ini. Aplikasi bisa di-install di HP (Android/iPhone) dan laptop langsung dari browser.

---

## Fitur

| Halaman | Isi |
|---|---|
| **Login** | Masuk dengan link atau kode undangan sekali pakai (1 kode = 1 perangkat) |
| **Cari Data** | Cari berdasarkan customer, barang, ukuran, nomer faktur, dan tanggal; pintasan tanggal; urutkan; pilih jumlah baris per halaman; print laporan |
| **Analisa** | Total omset, qty terjual, jumlah transaksi, grafik pendapatan bulanan, top barang terlaris, top pembeli |
| **Profil customer** | Total belanja, jumlah faktur, transaksi terakhir, riwayat belanja |
| **Detail barang** | Spesifikasi, total qty & omset, harga terakhir, grafik per bulan, daftar pembeli |
| **Hapus data** | Cari nomer faktur, centang baris yang mau dihapus, konfirmasi dua kali |

Fitur lain: ukuran teks (Aa) yang tersimpan per perangkat, tampilan khusus HP dan laptop, tombol Install, dan animasi yang otomatis mati jika perangkat memakai pengaturan "kurangi gerakan".

---

## Cara kerja

```
Foto faktur ──► Google Drive (folder nota)
                     │
                     ▼
            Apps Script: code.gs  ──► Gemini API (OCR)
            (trigger harian & mingguan)
                     │
                     ▼
            Google Sheets ("Penjualan <tahun>", "Users")
                     │
                     ▼
            Apps Script: api.gs  (Web App, membalas JSON)
                     │  fetch()
                     ▼
            PWA di GitHub Pages (repo ini)  ──► HP & laptop
```

- **Repo ini hanya berisi tampilan.** Data penjualan, foto, dan API key tidak pernah disimpan di sini.
- Setiap permintaan data membawa token perangkat. Tanpa token yang valid, server membalas `unauthorized`.

---

## Isi repo

| File | Fungsi |
|---|---|
| `index.html` | Seluruh tampilan dan logika aplikasi |
| `config.js` | URL Web App Apps Script (`/exec`) |
| `manifest.json` | Nama, warna, dan ikon aplikasi untuk install |
| `sw.js` | Service worker: cache file aplikasi dan update otomatis |
| `icons/` | Logo dan ikon aplikasi (HP, iPhone, laptop, tab browser) |

> **Jangan pernah upload** `code.gs`, `api.gs`, atau API key Gemini ke repo ini.

---

## Setup pertama kali

### 1. Apps Script

1. Buka spreadsheet → **Extensions → Apps Script**.
2. Pastikan ada file `code.gs` (OCR) dan `api.gs` (API untuk aplikasi).
3. Di `api.gs`, isi `APP_URL` dengan URL GitHub Pages (lihat langkah 2).
4. Jalankan fungsi `sheetUsers` sekali dari editor untuk memberi izin akses. Fungsi ini sekaligus membuat sheet `Users`.
5. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin URL yang berakhiran `/exec`.

### 2. GitHub Pages

1. Isi `config.js` dengan URL `/exec` dari langkah 1.
2. Upload semua file ke repo → **Settings → Pages** → Branch `main` / `(root)` → Save.
3. Aplikasi bisa dibuka di `https://USERNAME.github.io/alvian/`.

---

## Mengelola pengguna

Semua dilakukan dari spreadsheet, lewat menu **Alvian** (muncul setelah spreadsheet di-refresh).

| Kebutuhan | Cara |
|---|---|
| Tambah perangkat baru | **Alvian → Buat undangan** → isi nama (misal `Budi - HP`) → kirim link yang muncul |
| Cabut akses | Di sheet `Users`, ubah kolom Status jadi `NONAKTIF` (berlaku paling lama 10 menit) |
| User ganti HP / data browser terhapus / menekan Logout | Pilih baris user di sheet `Users` → **Alvian → Reset perangkat** → kirim ulang link yang sama |

Catatan:
- **1 link = 1 perangkat.** HP dan laptop milik orang yang sama tetap butuh link masing-masing.
- Kode yang salah dibatasi 20 kali per 10 menit, supaya tidak bisa ditebak.

---

## Install aplikasi

| Perangkat | Langkah |
|---|---|
| Android | Buka link undangan di **Chrome** → tap tombol **Install** (kuning) atau menu ⋮ → **Install app** |
| Laptop | Buka link di **Chrome / Edge** → klik **Install** di header atau ikon install di address bar |
| iPhone | Buka link di **Safari** → Share → **Add to Home Screen** → buka app dari Home Screen → masukkan kode yang ditampilkan |

---

## Update aplikasi

### Tampilan (repo ini)
1. Ubah file → upload / commit ke repo.
2. **Naikkan nomor versi** di `sw.js` (misal `alvian-v5` → `alvian-v6`) supaya semua perangkat mengambil versi baru.
3. Tunggu 1–2 menit. Di perangkat: refresh (Ctrl+Shift+R), atau tutup dan buka lagi aplikasinya.

### Server (Apps Script)
1. Edit kode di editor Apps Script → Save.
2. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**

> Jangan pilih **New deployment** saat update, karena URL `/exec` akan berubah dan aplikasi tidak bisa mengambil data lagi.

---

## Endpoint API (`api.gs`)

| Metode | `action` | Fungsi |
|---|---|---|
| GET | `klaim` | Tukar kode undangan menjadi token perangkat |
| GET | `data` | Ambil semua data penjualan (`paksa=1` untuk melewati cache) |
| POST | `hapusBaris` | Hapus baris tertentu (yang dicentang di window Hapus) |
| POST | `hapus` | Hapus semua baris dengan satu nomer faktur (versi lama) |

POST dikirim dengan `Content-Type: text/plain` supaya browser tidak mengirim CORS preflight, karena Apps Script tidak bisa menjawabnya.

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| "Gagal mengambil data" | URL `/exec` berubah atau salah | Cek URL di Apps Script → Manage deployments, lalu samakan dengan `config.js` |
| "Akses di perangkat ini sudah tidak berlaku" | Token dinonaktifkan atau di-reset | Kirim ulang link undangan (Reset perangkat) |
| Hapus menampilkan "Server belum diperbarui" | `api.gs` versi baru belum di-deploy | Deploy ulang sebagai **New version** |
| Tampilan masih versi lama | Cache browser / service worker | Naikkan versi di `sw.js`, lalu tutup dan buka lagi aplikasinya (kadang perlu 2 kali) |
| Grafik tidak muncul | Library grafik (Chart.js) belum termuat | Cek internet, tekan tombol refresh |
| Menu **Alvian** tidak muncul di spreadsheet | `onOpen` belum jalan / izin belum diberikan | Jalankan `sheetUsers` sekali dari editor, lalu refresh spreadsheet |
