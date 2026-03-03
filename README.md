# TaskManager Test Project

A React Native task management application with Firebase integration, offline/online sync, and advanced features.

## Features

- ✅ Firebase/Firestore integration for cloud storage
- ✅ Offline/online synchronization
- ✅ RTK Query for efficient API management
- ✅ Task categories and filtering
- ✅ Pagination for large task lists
- ✅ Image attachments for tasks
- ✅ Redux Toolkit for state management
- ✅ Dark/Light theme support
- ✅ Comprehensive testing (Unit & Integration)

## Prerequisites

- Node.js >= 18
- Yarn or npm
- Android Studio & Android SDK (for Android development)
- Firebase project (see FIREBASE_SETUP.md)

## Getting Started

### 1. Install Dependencies

```sh
yarn install
```

### 2. Firebase Setup

**Important:** Before running the app, you need to set up Firebase:

1. Follow instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Download `google-services.json` from Firebase Console
3. Place it in `android/app/` directory

### 3. Run the App

Start Metro bundler:
```sh
yarn start
```

Run on Android (in a separate terminal):
```sh
yarn android
```

Run on iOS (Mac only):
```sh
yarn ios
```

## Testing

Run all tests:
```sh
yarn test
```

Run specific test file:
```sh
yarn test src/tests/taskSlice.test.ts
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── config/          # Firebase and app configuration
├── navigation/      # React Navigation setup
├── screens/         # Screen components
├── services/        # Firebase and API services
├── store/           # Redux store and slices
├── tests/           # Test files
├── theme/           # Theme and design system
└── types/           # TypeScript type definitions
```

## Technologies Used

- React Native 0.79
- TypeScript
- Redux Toolkit & RTK Query
- Firebase (Firestore, Storage, Auth)
- React Navigation
- Jest for testing

## Troubleshooting

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase-specific issues.
