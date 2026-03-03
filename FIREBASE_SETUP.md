# Firebase Setup Instructions

## Prerequisites
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Firebase Storage in your Firebase project

## Android Setup

### Step 1: Download google-services.json
1. Go to Firebase Console → Project Settings
2. Under "Your apps", click on Android app (or add new Android app)
3. Register your app with package name: `com.taskmanager` (found in `android/app/build.gradle`)
4. Download `google-services.json`
5. Place it in `android/app/` directory

### Step 2: Configure Android Project
The project already includes necessary Firebase dependencies. Verify the following files:

**android/build.gradle** should have:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**android/app/build.gradle** should have at the bottom:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Step 3: Firebase Configuration
Update `src/config/firebase.ts` with your Firebase credentials (optional, as credentials are in google-services.json):
```typescript
export const firebaseConfig: FirebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
};
```

### Step 4: Firestore Security Rules
Set up Firestore security rules in Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if true; // For development only
      // In production, add proper authentication rules
    }
    match /categories/{categoryId} {
      allow read, write: if true;
    }
  }
}
```

### Step 5: Storage Security Rules
Set up Storage security rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tasks/{taskId}/{imageId} {
      allow read, write: if true; // For development only
      // In production, add proper authentication and size limits
    }
  }
}
```

### Step 6: Rebuild the app
```bash
# Clean build
cd android
./gradlew clean

# Run the app
cd ..
yarn android
```

## iOS Setup (if needed)
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in `ios/TaskManager/` directory
3. Run `cd ios && pod install`
4. Rebuild the app

## Testing Firebase Connection
After setup, the app will automatically connect to Firebase. Check the logs for any connection issues.

## Troubleshooting
- If you get "Default Firebase app not initialized", ensure `google-services.json` is in the correct location
- If build fails, try cleaning the project: `cd android && ./gradlew clean`
- Verify your package name matches in Firebase Console and `android/app/build.gradle`
