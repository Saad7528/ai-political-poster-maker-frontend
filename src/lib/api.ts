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

  syncOAuth: async (data: { name: string; email: string; avatarUrl?: string }) => {
    const res = await fetch(`${API_BASE}/auth/sync-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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

  // Admin Panel APIs
  getAdminStats: async (token: string) => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getAdminPosters: async (token: string, params?: { status?: string; flagged?: boolean; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.flagged) query.append('flagged', 'true');
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    const url = queryString ? `${API_BASE}/admin/posters?${queryString}` : `${API_BASE}/admin/posters`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  flagAdminPoster: async (id: string, isFlagged: boolean, flagReason: string, token: string) => {
    const res = await fetch(`${API_BASE}/admin/posters/${id}/flag`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isFlagged, flagReason }),
    });
    return res.json();
  },

  deleteAdminPoster: async (id: string, token: string) => {
    const res = await fetch(`${API_BASE}/admin/posters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getAdminUsers: async (token: string) => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  createAdminTemplate: async (templateData: unknown, token: string) => {
    const res = await fetch(`${API_BASE}/admin/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(templateData),
    });
    return res.json();
  },

  updateAdminTemplate: async (id: string, templateData: unknown, token: string) => {
    const res = await fetch(`${API_BASE}/admin/templates/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(templateData),
    });
    return res.json();
  },

  deleteAdminTemplate: async (id: string, token: string) => {
    const res = await fetch(`${API_BASE}/admin/templates/${id}`, {
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


