import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProperties = createAsyncThunk('properties/fetchAll', async (filters = {}) => {
  const { data } = await api.get('/properties', { params: filters });
  return data;
});

export const fetchMyProperties = createAsyncThunk('properties/fetchMine', async () => {
  const { data } = await api.get('/properties/mine/list');
  return data;
});

export const createProperty = createAsyncThunk('properties/create', async (payload) => {
  const { data } = await api.post('/properties', payload);
  return data;
});

export const updateProperty = createAsyncThunk('properties/update', async ({ id, ...patch }) => {
  const { data } = await api.put(`/properties/${id}`, patch);
  return data;
});

export const deleteProperty = createAsyncThunk('properties/delete', async (id) => {
  await api.delete(`/properties/${id}`);
  return id;
});

const slice = createSlice({
  name: 'properties',
  initialState: { items: [], mine: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProperties.pending,    (s) => { s.loading = true; });
    b.addCase(fetchProperties.fulfilled,  (s, a) => { s.loading = false; s.items = a.payload; });
    b.addCase(fetchMyProperties.fulfilled,(s, a) => { s.mine = a.payload; });
    b.addCase(createProperty.fulfilled,   (s, a) => { s.mine.unshift(a.payload); });
    b.addCase(updateProperty.fulfilled,   (s, a) => {
      s.mine = s.mine.map((p) => p._id === a.payload._id ? a.payload : p);
    });
    b.addCase(deleteProperty.fulfilled,   (s, a) => { s.mine = s.mine.filter((p) => p._id !== a.payload); });
  },
});

export default slice.reducer;
