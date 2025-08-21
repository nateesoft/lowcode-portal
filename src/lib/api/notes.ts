import apiClient from './client';
import { Note } from '../types';

export interface CreateNoteRequest {
  content: string;
  color?: string;
  position?: { x: number; y: number };
  userId?: number;
}

export interface UpdateNoteRequest {
  content?: string;
  color?: string;
  position?: { x: number; y: number };
}

export const notesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/notes');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  },

  create: async (data: CreateNoteRequest) => {
    const response = await apiClient.post('/notes', data);
    return response.data;
  },

  update: async (id: number, data: UpdateNoteRequest) => {
    const response = await apiClient.put(`/notes/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/notes/${id}`);
    return response.data;
  },

  search: async (query: string) => {
    const response = await apiClient.get(`/notes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};