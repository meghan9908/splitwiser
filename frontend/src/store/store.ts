import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expensesReducer from './slices/expensesSlice';
import groupsReducer from './slices/groupsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    expenses: expensesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
