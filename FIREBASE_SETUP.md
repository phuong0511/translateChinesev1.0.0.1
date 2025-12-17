# 🔧 Firebase Configuration Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Project name: `classical-chinese-novel`
4. Enable Google Analytics (optional)
5. Wait for project creation

## 2. Create Firestore Database

1. In Firebase console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose: **Start in production mode**
4. Select region: **asia-southeast1** (nearest to Vietnam)
5. Create database

## 3. Setup Security Rules

Go to **Firestore** → **Rules** and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth.uid != null;
      allow write: if request.auth.uid == userId;
    }

    // Public collections
    match /genres/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }

    match /novels/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }

    match /chapters/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }

    match /translations/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }

    match /static_profiles/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }

    match /dynamic_contexts/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }

    match /translation_history/{document=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null;
    }
  }
}
```

## 4. Get Firebase Credentials

1. Go to **Project Settings** (gear icon)
2. Select **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Or copy web app config:

```
Settings → Project settings → Your apps → Web app
```

## 5. Update `.env.local`

Add these variables to `.env.local`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 6. Create Collections in Firestore

The collections will be auto-created when you insert data, or manually:

- `users`
- `genres`
- `novels`
- `chapters`
- `translations`
- `static_profiles`
- `dynamic_contexts`
- `translation_history`

## 7. Initialize Data (Optional)

Run this to add sample genres:

```typescript
import databaseService from './services/firebaseService';

// Sample genres
const genres = [
  { id: 'xianxia', name: 'Tiên Hiệp', slug: 'xianxia', description: 'Tiên Hiệp' },
  { id: 'xuanhuan', name: 'Huyễn Thực', slug: 'xuanhuan', description: 'Huyễn Thực' },
  { id: 'wuxia', name: 'Võ Hiệp', slug: 'wuxia', description: 'Võ Hiệp' },
];

genres.forEach(async (genre) => {
  await databaseService.createGenre(genre);
});
```

---

## Alternative: SharePoint (Advanced)

If you want to use SharePoint instead:

1. Create a SharePoint site
2. Use Microsoft Graph API to manage lists
3. Requires more complex OAuth setup
4. More suitable for enterprise

**Firebase is recommended for this project!** ✅
