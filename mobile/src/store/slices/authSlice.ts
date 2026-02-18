import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services';
import { setTokens, clearTokens } from '../../services/api';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';
import { AuthState, LoginCredentials, RegisterData, User, AuthTokens } from '../../types';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const { user, tokens } = response.data;

      // Save to storage
      await storage.set(STORAGE_KEYS.USER_DATA, user);
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
      await storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

      // Set tokens in API service
      setTokens(tokens.accessToken, tokens.refreshToken);

      return { user, tokens };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      const { user, tokens } = response.data;

      // Save to storage
      await storage.set(STORAGE_KEYS.USER_DATA, user);
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
      await storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

      // Set tokens in API service
      setTokens(tokens.accessToken, tokens.refreshToken);

      return { user, tokens };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();

    // Clear storage
    await storage.remove(STORAGE_KEYS.USER_DATA);
    await storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    await storage.remove(STORAGE_KEYS.REFRESH_TOKEN);

    // Clear tokens from API service
    clearTokens();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(data);
      const user = response.data;

      // Update storage
      await storage.set(STORAGE_KEYS.USER_DATA, user);

      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredAuth = createAsyncThunk('auth/loadStored', async (_, { rejectWithValue }) => {
  try {
    const user = await storage.get<User>(STORAGE_KEYS.USER_DATA);
    const accessToken = await storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = await storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);

    if (user && accessToken && refreshToken) {
      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      };

      setTokens(accessToken, refreshToken);

      return { user, tokens };
    }

    return null;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: builder => {
    // Login
    builder.addCase(login.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.fulfilled, state => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Update Profile
    builder.addCase(updateProfile.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Load Stored Auth
    builder.addCase(loadStoredAuth.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(loadStoredAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      }
    });
    builder.addCase(loadStoredAuth.rejected, state => {
      state.isLoading = false;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
