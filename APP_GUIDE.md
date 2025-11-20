# MoneyTrack - Panduan Aplikasi

Aplikasi catatan keuangan pribadi dengan desain Gen Z yang modern dan menarik!

## 🎯 Fitur Utama

### 1. **Dashboard**
- Lihat total saldo dari semua wallet
- Ringkasan pendapatan dan pengeluaran bulan ini
- 5 transaksi terakhir
- Quick actions untuk tambah pendapatan/pengeluaran

### 2. **Wallet Management**
- Buat wallet baru (Bank, Cash, E-Wallet)
- Template preset untuk wallet populer (BCA, BRI, Mandiri, GoPay, OVO, DANA)
- Edit dan hapus wallet
- Lihat saldo per wallet dengan warna kustom

### 3. **Transaksi**
- **Tambah Pendapatan**: Catat penghasilan dari berbagai sumber
  - Kategori: Gaji, Bonus, Bisnis, Investasi, Hadiah, Lainnya
- **Tambah Pengeluaran**: Catat pengeluaran harian
  - Kategori: Makanan, Transport, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Lainnya
- Input dengan number pad yang mudah
- Pilih wallet untuk transaksi
- Tambah deskripsi untuk catatan detail

### 4. **History**
- Lihat semua riwayat transaksi
- Filter by type (Semua, Pendapatan, Pengeluaran)
- Grouped by date untuk navigasi mudah
- Total pendapatan dan pengeluaran keseluruhan

### 5. **Profile**
- Lihat informasi akun
- Settings aplikasi
- Bantuan & FAQ
- Logout

## 🎨 Design Gen Z

Aplikasi ini menggunakan design modern dengan elemen Gen Z:
- **Gradient backgrounds** yang vibrant
- **Rounded corners** untuk semua elements
- **Smooth animations** menggunakan React Native Reanimated
- **Color-coded categories** untuk mudah dikenali
- **Card-based layout** yang clean dan modern
- **Icon-based navigation** yang intuitif

## 🚀 Cara Menggunakan

### Pertama Kali

1. **Register**: Buat akun baru dengan email dan password
2. **Setup Wallet**: Tambahkan wallet pertama (contoh: Cash atau Bank)
3. **Tambah Saldo Awal**: Masukkan saldo awal wallet

### Penggunaan Sehari-hari

1. **Catat Pendapatan**:
   - Tap tombol "Tambah Pendapatan" di dashboard
   - Masukkan jumlah
   - Pilih wallet tujuan
   - Pilih kategori
   - Tambah deskripsi
   - Simpan

2. **Catat Pengeluaran**:
   - Tap tombol "Tambah Pengeluaran" di dashboard
   - Masukkan jumlah
   - Pilih wallet sumber
   - Pilih kategori
   - Tambah deskripsi
   - Simpan

3. **Lihat Laporan**:
   - Dashboard menampilkan ringkasan bulan ini
   - History menampilkan semua transaksi
   - Filter untuk melihat pendapatan atau pengeluaran saja

## 💡 Tips & Trik

1. **Gunakan Multiple Wallets**: Pisahkan uang berdasarkan sumber untuk tracking lebih baik
2. **Konsisten Catat**: Catat setiap transaksi segera setelah terjadi
3. **Gunakan Kategori**: Membantu analisa pengeluaran kamu
4. **Tambah Deskripsi**: Untuk mengingat detail transaksi
5. **Check Dashboard Rutin**: Lihat progress keuangan kamu setiap hari

## 🔒 Keamanan

- Data tersimpan aman di Firebase
- Authentication menggunakan email & password
- Security rules memastikan hanya kamu yang bisa akses data kamu
- Tidak ada sharing data ke pihak ketiga

## 🐛 Troubleshooting

### Login gagal
- Pastikan email dan password benar
- Check koneksi internet
- Pastikan sudah register terlebih dahulu

### Data tidak tersimpan
- Check koneksi internet
- Logout dan login kembali
- Restart aplikasi

### Wallet tidak bisa dihapus
- Pastikan tidak ada transaksi yang masih terkait
- Hapus transaksi terlebih dahulu

## 📱 Platform Support

Aplikasi ini dibangun dengan React Native & Expo, support untuk:
- ✅ Web Browser
- ✅ iOS (via Expo Go atau Dev Build)
- ✅ Android (via Expo Go atau Dev Build)

## 🆘 Bantuan

Jika ada pertanyaan atau masalah:
1. Check FIREBASE_SETUP.md untuk setup Firebase
2. Check dokumentasi kode untuk technical details
3. Hubungi developer

---

**MoneyTrack v1.0.0**
_Kelola keuangan dengan mudah & seru!_ 💰✨
