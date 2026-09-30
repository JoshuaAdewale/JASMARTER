import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMyLeases = createAsyncThunk('leases/fetchMine', async () => {
  const { data } = await api.get('/leases/mine');
  return data;
});

export const applyForLease = createAsyncThunk('leases/apply', async ({ propertyId, payload }) => {
  const { data } = await api.post(`/leases/apply/${propertyId}`, payload);
  return data;
});

export const decideLease = createAsyncThunk('leases/decide', async ({ id, action }) => {
  const { data } = await api.post(`/leases/${id}/decision`, { action });
  return data;
});

const slice = createSlice({
  name: 'leases',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyLeases.fulfilled, (s, a) => { s.items = a.payload; });
    b.addCase(applyForLease.fulfilled, (s, a) => { s.items.unshift(a.payload); });
    b.addCase(decideLease.fulfilled,   (s, a) => {
      s.items = s.items.map((l) => l._id === a.payload._id ? a.payload : l);
    });
  },
});

export default slice.reducer;
