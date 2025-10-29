import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { organizationService } from '@/services/organizationService';

interface Organization {
  id: number;
  name: string;
  role?: string;
  is_active?: boolean;
}

interface Member {
  id: number;
  username: string;
  email: string;
  role: string;
  joined_at: string;
}

interface OrganizationState {
  organizations: Organization[];
  activeOrganization: Organization | null;
  members: Member[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organizations: [],
  activeOrganization: null,
  members: [],
  isLoading: false,
  error: null,
};

export const fetchOrganizations = createAsyncThunk(
  'organization/fetchOrganizations',
  async () => {
    const response = await organizationService.getUserOrganizations();
    return response.organizations;
  }
);

export const createOrganization = createAsyncThunk(
  'organization/createOrganization',
  async (name: string) => {
    const response = await organizationService.createOrganization(name);
    return response.organization;
  }
);

export const setActiveOrganization = createAsyncThunk(
  'organization/setActiveOrganization',
  async (orgId: string) => {
    const response = await organizationService.setActiveOrganization(orgId);
    return response.organization;
  }
);

export const fetchMembers = createAsyncThunk(
  'organization/fetchMembers',
  async (orgId: string) => {
    const response = await organizationService.getOrganizationMembers(orgId);
    return response.members;
  }
);

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizations = action.payload;
        state.activeOrganization = action.payload.find((org: Organization) => org.is_active) || null;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch organizations';
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.organizations.push(action.payload);
      })
      .addCase(setActiveOrganization.fulfilled, (state, action) => {
        state.activeOrganization = action.payload;
        state.organizations = state.organizations.map(org => ({
          ...org,
          is_active: org.id === action.payload.id
        }));
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      });
  },
});

export default organizationSlice.reducer;
