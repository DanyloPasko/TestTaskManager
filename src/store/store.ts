import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import taskReducer from './taskSlice';
import categoryReducer from './categorySlice';
import filterReducer from './filterSlice';
import themeReducer from './themeSlice.ts';
import { combineReducers } from 'redux';
import { tasksApi } from './api/tasksApi';
import { setupListeners } from '@reduxjs/toolkit/query';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['tasks', 'categories', 'filters'],
  blacklist: ['tasksApi'], // Don't persist RTK Query cache
};

const rootReducer = combineReducers({
  tasks: taskReducer,
  categories: categoryReducer,
  filters: filterReducer,
  theme: themeReducer,
  [tasksApi.reducerPath]: tasksApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(tasksApi.middleware),
});

export const persistor = persistStore(store);

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
