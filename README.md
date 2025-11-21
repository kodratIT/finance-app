# Finance App 💰

Aplikasi manajemen keuangan pribadi dengan React Native (Expo) dan Firebase.

> 🚀 **Baru di sini?** Mulai dengan [QUICK_START.md](QUICK_START.md)

## Features ✨

- 📧 Email/Password Authentication
- 🔐 Google Sign-In (Web & Mobile)
- 💸 Expense & Income Tracking
- 👛 Multi-Wallet Management
- 📊 Financial History
- 🎨 Beautiful UI with Gradient Themes

## Quick Start 🚀

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env` dan isi dengan Firebase credentials Anda.

### 3. Setup Google Sign-In (Opsional)
Lihat panduan lengkap di: **[SETUP_GOOGLE_SSO.md](SETUP_GOOGLE_SSO.md)**

Quick steps:
1. Aktifkan Google Sign-In di Firebase Console
2. Dapatkan Web Client ID dari Google Cloud Console
3. Update `.env` dengan Web Client ID
4. Restart Expo

### 4. Run Development Server
```bash
npm run dev
```

Pilih platform:
- Press `w` untuk Web
- Press `a` untuk Android (Expo Go)
- Press `i` untuk iOS (Expo Go)

## Documentation 📚

- **[QUICK_START.md](QUICK_START.md)** - Panduan cepat untuk memulai
- **[SETUP_GOOGLE_SSO.md](SETUP_GOOGLE_SSO.md)** - Panduan setup Google Sign-In
- **[GOOGLE_SSO_CHECKLIST.md](GOOGLE_SSO_CHECKLIST.md)** - Checklist setup
- **[TROUBLESHOOTING_GOOGLE_SSO.md](TROUBLESHOOTING_GOOGLE_SSO.md)** - Troubleshooting guide
- **[GOOGLE_SSO_FIX.md](GOOGLE_SSO_FIX.md)** - Dokumentasi teknis Google SSO
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Firebase setup guide
- **[APP_GUIDE.md](APP_GUIDE.md)** - App usage guide

## Tech Stack 🛠️

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Backend:** Firebase (Auth + Realtime Database)
- **UI:** React Native + Expo Linear Gradient
- **Icons:** Lucide React Native
- **Navigation:** Expo Router
- **Storage:** AsyncStorage

## Project Structure 📁

```
finance-app/
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Register screen
│   └── welcome.tsx        # Welcome screen
├── components/            # Reusable components
├── contexts/              # React Context (Auth, Theme)
├── config/                # Firebase configuration
├── services/              # Business logic services
├── types/                 # TypeScript types
└── .env                   # Environment variables
```

## Environment Variables 🔐

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
```

## Troubleshooting 🔧

Jika mengalami masalah dengan Google Sign-In, lihat: **[TROUBLESHOOTING_GOOGLE_SSO.md](TROUBLESHOOTING_GOOGLE_SSO.md)**

Common issues:
- ❌ "Client Id property must be defined" → Update `.env` dan restart
- ❌ "Invalid Client" → Pastikan menggunakan Web Client ID
- ❌ "Auth persistence warning" → Sudah diperbaiki otomatis

## License 📄

MIT
