import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { ApiErrorClass, Group } from '../../types';

interface GroupsState {
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  selectedGroup: null,
  isLoading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getGroups();
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          details: error.details ? JSON.stringify(error.details) : undefined
        });
      }
      return rejectWithValue({
        message: 'Failed to fetch groups',
        status: 0,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export const fetchGroupDetails = createAsyncThunk(
  'groups/fetchGroupDetails',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await apiService.getGroupDetails(groupId);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          details: error.details ? JSON.stringify(error.details) : undefined
        });
      }
      return rejectWithValue({
        message: 'Failed to fetch group details',
        status: 0,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async ({ name, currency }: { name: string; currency?: string }, { rejectWithValue }) => {
    try {
      return await apiService.createGroup(name, currency);
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
        message: 'Failed to create group',
        status: 0,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async (joinCode: string, { rejectWithValue }) => {
    try {
      return await apiService.joinGroup(joinCode);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          details: error.details ? JSON.stringify(error.details) : undefined
        });
      }
      return rejectWithValue({
        message: 'Failed to join group',
        status: 0,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
    },
    clearGroupsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch groups
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message || 'Failed to fetch groups';
      });

    // Fetch group details
    builder
      .addCase(fetchGroupDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedGroup = action.payload;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message || 'Failed to fetch group details';
      });

    // Create group
    builder
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = [...state.groups, action.payload];
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message || 'Failed to create group';
      });

    // Join group
    builder
      .addCase(joinGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the joined group to the list
        state.groups = [...state.groups, action.payload];
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message || 'Failed to join group';
      });
  },
});

export const { clearSelectedGroup, clearGroupsError } = groupsSlice.actions;
export default groupsSlice.reducer;
