import { IPoster } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth
  register: async (data: { name: string; emailOrPhone: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (data: { emailOrPhone: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getMe: async (token: string) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Templates
  getTemplates: async (occasion?: string) => {
    const url = occasion && occasion !== 'all' ? `${API_BASE}/templates?occasion=${occasion}` : `${API_BASE}/templates`;
    const res = await fetch(url);
    return res.json();
  },

  getTemplateById: async (id: string) => {
    const res = await fetch(`${API_BASE}/templates/${id}`);
    return res.json();
  },

  // Gemini AI Copywriting & Layout Composer
  generateAICopy: async (
    data: {
      promptText?: string;
      occasionType?: string;
      candidateName?: string;
      designation?: string;
      party?: string;
      district?: string;
      unionOrThana?: string;
      constituencyName?: string;
      customKeywords?: string;
    },
    token: string
  ) => {
    const res = await fetch(`${API_BASE}/ai/generate-copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Poster CRUD & Render
  createPoster: async (posterData: Partial<IPoster> & { formData: unknown; templateId: string }, token: string) => {
    const res = await fetch(`${API_BASE}/posters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(posterData),
    });
    return res.json();
  },

  getPosterById: async (id: string, token: string) => {
    const res = await fetch(`${API_BASE}/posters/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getUserPosters: async (userId: string, token: string) => {
    const res = await fetch(`${API_BASE}/posters/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  regeneratePoster: async (id: string, updateData: Partial<IPoster>, token: string) => {
    const res = await fetch(`${API_BASE}/posters/${id}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  deletePoster: async (id: string, token: string) => {
    const res = await fetch(`${API_BASE}/posters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // File Upload
  uploadSingle: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch(`${API_BASE}/upload/single`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('photos', f));
    const res = await fetch(`${API_BASE}/upload/multiple`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
};
