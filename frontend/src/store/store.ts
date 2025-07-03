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
        // Ignore these action types for serialization checks
        ignoredActions: [
          'persist/PERSIST',
          'auth/loginUser/rejected',
          'auth/signupUser/rejected',
          'auth/loginWithGoogle/rejected',
          'groups/createGroup/rejected',
          'groups/fetchGroups/rejected',
          'groups/fetchGroupDetails/rejected',
          'groups/joinGroup/rejected',
          'expenses/createExpense/rejected',
          'expenses/fetchExpenses/rejected'
        ],
        // Ignore these paths for serialization checks
        ignoredPaths: [
          'auth.error', 
          'groups.error', 
          'expenses.error',
          'payload.details',
          'payload.error',
          'error.details'
        ],
        // Increase the threshold for development environment
        warnAfter: 100,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
