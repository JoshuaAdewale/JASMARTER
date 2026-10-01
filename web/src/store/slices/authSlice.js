import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    localStorage.setItem('jasmarta_token', data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || 'Login failed'); }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('jasmarta_token', data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || 'Registration failed'); }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/auth/me'); return data.user; }
  catch (e) { return rejectWithValue(e.response?.data?.error || 'Failed'); }
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('jasmarta_token') || null, loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null; state.token = null;
      localStorage.removeItem('jasmarta_token');
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending,    (s) => { s.loading = true; s.error = null; });
    b.addCase(login.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; });
    b.addCase(login.rejected,   (s, a) => { s.loading = false; s.error = a.payload; });
    b.addCase(register.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; });
    b.addCase(register.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
    b.addCase(fetchMe.fulfilled,  (s, a) => { s.user = a.payload; });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
