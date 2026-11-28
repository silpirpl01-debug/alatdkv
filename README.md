
# AlatDKV

Aplikasi peminjaman alat Laboratorium Desain Komunikasi Visual (DKV) untuk membantu siswa melihat ketersediaan alat, mengajukan peminjaman, dan memantau status pengajuan. Admin dapat mengelola alat serta memproses peminjaman.

## 1. Nama Aplikasi dan URL

- Nama aplikasi: AlatDKV
- Repository GitHub: https://github.com/silpirpl01-debug/alatdkv
- URL aplikasi: (diisi setelah deploy ke Vercel)

## 2. Cara Menjalankan Aplikasi

### Persyaratan
- Node.js
- npm
- Akun Supabase

### Instalasi

Clone repository:

```bash
git clone https://github.com/silpirpl01-debug/alatdkv.git
cd alatdkv
```

Install dependency:

```bash
npm install
```

Buat file `.env.local` di folder utama project dan isi variabel environment yang diperlukan.

Jalankan development server:

```bash
npm run dev
```

Buka aplikasi melalui:

http://localhost:3000

### Variabel Environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SESSION_SECRET`

Nilai variabel environment tidak dicantumkan dalam repository.

## 3. Daftar Halaman dan Fungsi

| Halaman | Fungsi |
|---|---|
| `/` | Halaman utama aplikasi |
| `/alat` | Menampilkan daftar alat yang tersedia |
| `/alat/[id]` | Menampilkan detail alat |
| `/ajukan` | Formulir pengajuan peminjaman |
| `/cek` | Mengecek status peminjaman |
| `/admin/login` | Login admin |
| `/admin` | Dashboard pengelolaan peminjaman |
| `/admin/alat` | Pengelolaan data alat |

## 4. Aturan Bisnis

- Peminjaman hanya dapat diajukan jika alat tersedia.
- Tanggal peminjaman tidak boleh sebelum tanggal hari ini.
- Tanggal peminjaman dibatasi maksimal 14 hari ke depan.
- Peminjaman hanya dilakukan pada hari kerja.
- Tanggal pengembalian tidak boleh sebelum tanggal peminjaman.
- Durasi peminjaman maksimal 3 hari.
- Jumlah alat yang dipinjam harus sesuai stok yang tersedia.
- Data peminjaman harus diisi dengan lengkap dan valid.
- Pengajuan diproses oleh admin.

Aturan validasi diterapkan pada form dan server untuk memastikan data pengajuan sesuai ketentuan aplikasi.

## 5. Keamanan Aplikasi

- Pengelolaan admin memerlukan autentikasi.
- Halaman admin dilindungi session login.
- Supabase Row Level Security (RLS) digunakan untuk membatasi akses data.
- Data alat dapat dibaca oleh pengguna sesuai kebijakan akses database.
- Operasi pengelolaan data dibatasi untuk akses yang berwenang.
- Secret key dan session secret disimpan dalam environment variable.
- File environment tidak dimasukkan ke repository GitHub.

## 6. Masalah yang Ditemui dan Perbaikan

### Masalah koneksi Supabase
Gejala:
Aplikasi mengalami error ketika mencoba mengambil data dari Supabase.

Penyebab:
Konfigurasi environment variable dan koneksi Supabase belum sesuai.

Perbaikan:
Memperbaiki nama variabel environment dan konfigurasi client Supabase.

### Masalah saat menggunakan cookies
Gejala:
Muncul error terkait `Blocking RouteServer` ketika halaman mengakses cookies atau data.

Perbaikan:
Menyesuaikan penggunaan cookies dan proses pengambilan data pada halaman Next.js.

### Masalah konfigurasi build
Gejala:
Terjadi error saat proses build akibat konfigurasi dynamic rendering.

Perbaikan:
Menyesuaikan konfigurasi halaman dengan pengaturan Next.js yang digunakan.

## 7. Bagian yang Belum Selesai

- Deployment aplikasi ke Vercel.
- Pengujian aplikasi pada URL online.
- Pemeriksaan akhir dokumentasi dan database.
- Persiapan presentasi dan demonstrasi aplikasi.
