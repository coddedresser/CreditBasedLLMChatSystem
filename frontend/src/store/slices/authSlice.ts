import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';

interface User {
  id: number;
  username: string;
  email: string;
  credits: number; // Keep for backward compatibility
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  organizationCredits: number; // NEW: Current organization credits
  currentOrganizationId: number | null; // NEW: Track current org
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  organizationCredits: 0,
  currentOrganizationId: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await authService.login(email, password);
    return response;
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ username, email, password }: { username: string; email: string; password: string }) => {
    const response = await authService.signup(username, email, password);
    return response;
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async () => {
    const response = await authService.verifyToken();
    return response;
  }
);

// NEW: Fetch organization credits
export const fetchOrganizationCredits = createAsyncThunk(
  'auth/fetchOrganizationCredits',
  async () => {
    const response = await authService.getOrganizationCredits();
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.organizationCredits = 0;
      state.currentOrganizationId = null;
      authService.logout();
    },
    updateCredits: (state, action: PayloadAction<number>) => {
      state.organizationCredits = action.payload;
    },
    setOrganizationCredits: (state, action: PayloadAction<{ credits: number; orgId: number }>) => {
      state.organizationCredits = action.payload.credits;
      state.currentOrganizationId = action.payload.orgId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Signup failed';
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchOrganizationCredits.fulfilled, (state, action) => {
        state.organizationCredits = action.payload.credits;
        state.currentOrganizationId = action.payload.organizationId;
      });
  },
});

export const { logout, updateCredits, setOrganizationCredits } = authSlice.actions;
export default authSlice.reducer;