import apiClient from './client';
import { 
  User, 
  UserType, 
  CreateUserTypeRequest, 
  UpdateUserTypeRequest,
  UserGroupData,
  CreateUserGroupRequest,
  UpdateUserGroupRequest,
  UserGroupStats,
  AddMembersDto
} from '../types/user';

export const userTypeAPI = {
  getAll: async () => {
    const response = await apiClient.get('/user-types');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/user-types/${id}`);
    return response.data;
  },

  create: async (data: CreateUserTypeRequest) => {
    const response = await apiClient.post('/user-types', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserTypeRequest) => {
    const response = await apiClient.put(`/user-types/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/user-types/${id}`);
    return response.data;
  }
};

export const userGroupAPI = {
  getAll: async () => {
    const response = await apiClient.get('/user-groups');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/user-groups/${id}`);
    return response.data;
  },

  create: async (data: CreateUserGroupRequest) => {
    const response = await apiClient.post('/user-groups', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserGroupRequest) => {
    const response = await apiClient.put(`/user-groups/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/user-groups/${id}`);
    return response.data;
  },

  getStats: async (): Promise<{ data: UserGroupStats }> => {
    const response = await apiClient.get('/user-groups/stats');
    return response.data;
  },

  addMembers: async (groupId: number, data: AddMembersDto) => {
    const response = await apiClient.post(`/user-groups/${groupId}/members`, data);
    return response.data;
  },

  removeMembers: async (groupId: number, data: AddMembersDto) => {
    const response = await apiClient.delete(`/user-groups/${groupId}/members`, { data });
    return response.data;
  }
};

export const usersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<User>) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  search: async (query: string) => {
    const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};