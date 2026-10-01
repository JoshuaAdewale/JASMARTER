import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    await AsyncStorage.setItem('jasmarta_token', data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || 'Login failed'); }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    await AsyncStorage.setItem('jasmarta_token', data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || 'Registration failed'); }
});

export const restoreSession = createAsyncThunk('auth/restore', async () => {
  const token = await AsyncStorage.getItem('jasmarta_token');
  if (!token) return null;
  try {
    const { data } = await api.get('/auth/me');
    return { user: data.user, token };
  } catch {
    await AsyncStorage.removeItem('jasmarta_token');
    return null;
  }
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null, restored: false },
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null;
      AsyncStorage.removeItem('jasmarta_token');
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending,    (s) => { s.loading = true; s.error = null; });
    b.addCase(login.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; });
    b.addCase(login.rejected,   (s, a) => { s.loading = false; s.error = a.payload; });
    b.addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; });
    b.addCase(restoreSession.fulfilled, (s, a) => {
      s.restored = true;
      if (a.payload) { s.user = a.payload.user; s.token = a.payload.token; }
    });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
