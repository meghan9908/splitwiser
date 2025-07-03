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
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch group expenses');
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
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create expense');
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearSelectedExpense, 
  clearExpensesError,
  setSelectedExpense
} = expensesSlice.actions;

export default expensesSlice.reducer;
