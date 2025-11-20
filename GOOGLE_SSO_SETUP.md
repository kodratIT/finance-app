# Google SSO Setup Guide

## Prerequisites
Google Sign-In is **available on all platforms** (Web, iOS, and Android) in this app using Firebase Authentication.

## Firebase Console Setup

### 1. Enable Google Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Enable the toggle
6. Add your **support email**
7. Click **Save**

### 2. Configure Authorized Domains
1. In Authentication settings, go to **Authorized domains**
2. Add your domains:
   - `localhost` (for local development)
   - Your production domain (e.g., `your-app.com`)

### 3. Get OAuth Credentials (Optional for Advanced Setup)
If you need custom OAuth client:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Your Firebase project already has OAuth client auto-created
4. Add authorized JavaScript origins:
   - `http://localhost:19006` (Expo web dev)
   - Your production URL
5. Add authorized redirect URIs:
   - `http://localhost:19006/__/auth/handler`
   - `https://your-project.firebaseapp.com/__/auth/handler`

## Testing Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app:
   - **Web**: Browser (http://localhost:19006)
   - **iOS**: Expo Go app or development build
   - **Android**: Expo Go app or development build

3. Click "Login dengan Google" or "Daftar dengan Google"

4. Choose your Google account

5. You'll be automatically logged in and redirected to the app

## Important Notes

- ✅ **All Platforms**: Google Sign-In works on Web, iOS, and Android
- ✅ **Auto User Creation**: First-time users are automatically created in Firebase Database
- ✅ **Same Function**: Both login and register use the same `loginWithGoogle()` function
- ✅ **Existing Users**: Existing Google users can login without re-registering
- ✅ **Profile Data**: Display name and email are automatically fetched from Google
- ✅ **Firebase Auth**: Uses Firebase Authentication for seamless cross-platform support

## Troubleshooting

### "This app isn't verified" Warning
- During development, you might see this warning
- Click "Advanced" → "Go to [your-app] (unsafe)" to continue
- For production, submit your app for [Google OAuth verification](https://support.google.com/cloud/answer/9110914)

### "Unauthorized domain" Error
- Make sure your domain is added to Firebase Authorized domains
- Check that localhost is authorized for development

### Popup Blocked
- Some browsers block popups by default
- Allow popups for your development domain
- The popup is required for Google authentication flow

## Security Best Practices

- ✅ Never commit Firebase config with real credentials
- ✅ Use environment variables for sensitive data
- ✅ Enable only required authentication providers
- ✅ Set up proper security rules in Firebase Database
- ✅ Implement Row Level Security (RLS) in your database

## User Flow

### Web Platform
```
User clicks "Login dengan Google"
        ↓
Google popup opens in new window
        ↓
User selects Google account
        ↓
Google authenticates user
        ↓
Firebase creates/updates user record
        ↓
App stores user data locally
        ↓
User redirected to main app (tabs)
```

### Mobile Platform (iOS/Android)
```
User clicks "Login dengan Google"
        ↓
Firebase handles authentication flow
        ↓
User selects Google account
        ↓
Google authenticates user
        ↓
Returns to app automatically
        ↓
Firebase creates/updates user record
        ↓
App stores user data locally
        ↓
User redirected to main app (tabs)
```

## Implementation Details

- **AuthContext**: Manages authentication state across all platforms
- **loginWithGoogle()**: Handles Google Sign-In using Firebase Authentication
- **Cross-Platform Support**: Works seamlessly on Web, iOS, and Android
- **signInWithPopup()**: Firebase method that adapts to platform automatically
- **Error Handling**: Graceful fallback to email/password if Google Sign-In fails
- **User Data Sync**: Automatic profile sync from Google account
