import api from './api';

export const organizationService = {
  async createOrganization(name: string) {
    const response = await api.post('/api/organizations', { name });
    return response.data;
  },

  async getUserOrganizations() {
    const response = await api.get('/api/organizations');
    return response.data;
  },

  async getOrganizationById(orgId: string) {
    const response = await api.get(`/api/organizations/${orgId}`);
    return response.data;
  },

  async updateOrganization(orgId: string, name: string) {
    const response = await api.put(`/api/organizations/${orgId}`, { name });
    return response.data;
  },

  async setActiveOrganization(orgId: string) {
    const response = await api.post(`/api/organizations/${orgId}/activate`);
    return response.data;
  },

  async inviteMember(orgId: string, email: string) {
    const response = await api.post(`/api/organizations/${orgId}/invite`, {
      email,
    });
    return response.data;
  },

  async getOrganizationMembers(orgId: string) {
    const response = await api.get(`/api/organizations/${orgId}/members`);
    return response.data;
  },

  // NEW METHODS - ADD THESE
  async getMyInvitations() {
    const response = await api.get('/api/organizations/invitations/my-invitations');
    return response.data;
  },

  async acceptInvitation(invitationId: number) {
    const response = await api.post(`/api/organizations/invitations/${invitationId}/accept`);
    return response.data;
  },

  async rejectInvitation(invitationId: number) {
    const response = await api.post(`/api/organizations/invitations/${invitationId}/reject`);
    return response.data;
  },

  async removeMember(orgId: string, memberId: number) {
    const response = await api.delete(`/api/organizations/${orgId}/members/${memberId}`);
    return response.data;
  },
  async updateMemberRole(orgId: string, memberId: number, role: string) {
  const response = await api.put(`/api/organizations/${orgId}/members/${memberId}/role`, {
    role,
  });
  return response.data;
},

async getSentInvitations(orgId: string) {
  const response = await api.get(`/api/organizations/${orgId}/invitations`);
  return response.data;
},

async resendInvitation(invitationId: number) {
  const response = await api.post(`/api/organizations/invitations/${invitationId}/resend`);
  return response.data;
},
// Add these methods

async getOrganizationCredits(orgId: string) {
  const response = await api.get(`/api/organizations/${orgId}/credits`);
  return response.data;
},

async addOrganizationCredits(orgId: string, amount: number) {
  const response = await api.post(`/api/organizations/${orgId}/credits/add`, {
    amount,
  });
  return response.data;
},
};
