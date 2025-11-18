import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Resource } from '../../types';
import resourceService, { ResourceQueryParams } from '../../services/resourceService';

export interface ResourceState {
  items: Resource[];
  favorites: Record<string, boolean>;
  filters: ResourceQueryParams;
  search: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
}

const initialState: ResourceState = {
  items: [],
  favorites: {},
  filters: {},
  search: '',
  status: 'idle',
};

export const fetchResources = createAsyncThunk(
  'resources/fetchAll',
  async (params?: ResourceQueryParams) => {
    const response = await resourceService.getAllResources(params);
    return response.data;
  }
);

export const searchResources = createAsyncThunk(
  'resources/search',
  async ({ query, params }: { query: string; params?: ResourceQueryParams }) => {
    const results = await resourceService.searchResources(query, params);
    return { query, results };
  }
);

export const toggleFavorite = createAsyncThunk(
  'resources/toggleFavorite',
  async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
    const updated = await resourceService.toggleFavorite(id, isFavorite);
    return updated;
  }
);

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ResourceQueryParams>) {
      state.filters = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(searchResources.fulfilled, (state, action) => {
        state.items = action.payload.results;
        state.search = action.payload.query;
        state.status = 'succeeded';
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const updated = action.payload;
        state.favorites[updated.id] = updated.isFavorite ?? false;
        state.items = state.items.map((item) =>
          item.id === updated.id ? { ...item, isFavorite: updated.isFavorite } : item
        );
      });
  },
});

export const { setFilters, setSearch } = resourceSlice.actions;
export default resourceSlice.reducer;
