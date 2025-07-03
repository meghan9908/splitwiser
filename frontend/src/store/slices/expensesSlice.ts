import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { ApiErrorClass, Expense } from '../../types';

interface ExpensesState {
  expenses: Expense[];
  selectedExpense: Expense | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  selectedExpense: null,
  isLoading: false,
  error: null,
};

export const fetchGroupExpenses = createAsyncThunk(
  'expenses/fetchGroupExpenses',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await apiService.getGroupExpenses(groupId);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        // Make sure we return serializable data
        return rejectWithValue({
          message: error.message,
          status: error.status,
          details: error.details ? JSON.stringify(error.details) : undefined
        });
      }
      return rejectWithValue({
        message: 'Failed to fetch group expenses',
        status: 0,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async ({ 
    groupId, 
    expenseData 
  }: { 
    groupId: string; 
    expenseData: {
      description: string;
      amount: number;
      category: string;
      date: string;
      payers: Array<{ userId: string; amount: number }>;
      splits: Array<{ userId: string; amount: number }>;
    } 
  }, { rejectWithValue }) => {
    try {
      return await apiService.createExpense(groupId, expenseData);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        // Make sure we return serializable data
        return rejectWithValue({
          message: error.message,
          status: error.status,
          details: error.details ? JSON.stringify(error.details) : undefined
        });
      }
      return rejectWithValue({
        message: 'Failed to create expense',
        status: 0,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
    },
    clearExpensesError: (state) => {
      state.error = null;
    },
    setSelectedExpense: (state, action) => {
      state.selectedExpense = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch group expenses
    builder
      .addCase(fetchGroupExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchGroupExpenses.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message || 'Failed to fetch expenses';
      });

    // Create expense
    builder
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = [...state.expenses, action.payload];
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message || 'Failed to create expense';
      });
  },
});

export const { 
  clearSelectedExpense, 
  clearExpensesError,
  setSelectedExpense
} = expensesSlice.actions;

export default expensesSlice.reducer;
