# Setup Firebase untuk MoneyTrack

Aplikasi ini menggunakan Firebase Realtime Database untuk menyimpan data. Ikuti langkah-langkah di bawah ini untuk setup Firebase:

## 1. Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Tambah project"
3. Masukkan nama project (contoh: "moneytrack-app")
4. Ikuti langkah-langkah setup hingga selesai

## 2. Aktifkan Firebase Authentication

1. Di Firebase Console, pilih project Anda
2. Klik "Authentication" di menu sidebar
3. Klik tab "Sign-in method"
4. Aktifkan "Email/Password" provider
5. Klik "Save"

## 3. Aktifkan Firebase Realtime Database

1. Di Firebase Console, klik "Realtime Database" di menu sidebar
2. Klik "Create Database"
3. Pilih lokasi server (pilih yang terdekat dengan user Anda)
4. Pilih "Start in test mode" untuk development
5. Klik "Enable"

## 4. Setup Security Rules (PENTING!)

Setelah database dibuat, update Security Rules untuk keamanan:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "wallets": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "transactions": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 5. Dapatkan Firebase Config

1. Di Firebase Console, klik icon gear (⚙️) di sebelah "Project Overview"
2. Pilih "Project settings"
3. Scroll ke bawah ke bagian "Your apps"
4. Klik icon Web (</>) untuk menambahkan web app
5. Masukkan nickname untuk app (contoh: "MoneyTrack Web")
6. Klik "Register app"
7. Copy Firebase configuration

## 6. Update File .env

Buka file `.env` di root project dan update dengan nilai dari Firebase Config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 7. Testing

Setelah setup selesai, jalankan aplikasi:

```bash
npm run dev
```

Buat akun baru melalui aplikasi dan test fitur-fitur yang ada:
- Register & Login
- Tambah Wallet
- Tambah Pendapatan
- Tambah Pengeluaran
- Lihat History

## Troubleshooting

### Error: Firebase not initialized
- Pastikan semua environment variables sudah diisi dengan benar
- Restart development server setelah update .env

### Error: Permission denied
- Check Firebase Security Rules
- Pastikan user sudah login dengan benar

### Data tidak tersimpan
- Check Firebase Console -> Realtime Database untuk melihat data
- Check browser console untuk error messages
- Pastikan Security Rules sudah di-setup dengan benar

## Production

Untuk production, update Security Rules di Firebase Console dengan rules yang lebih strict dan sesuai dengan kebutuhan aplikasi Anda.
