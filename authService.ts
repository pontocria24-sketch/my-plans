
import { UserAccount, UserStatus, Task, Idea, Goal, Event, WorkLog, UserConfig } from './types';

/**
 * No diretório unificado, não precisamos de URL absoluta.
 * O navegador chamará o mesmo servidor que entregou o frontend.
 */
const apiRequest = async (endpoint: string, method: string = 'GET', data?: any) => {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error(`[API ERROR] Falha ao acessar ${endpoint}`);
    return null;
  }
};

export const db = {
  login: async (email: string, password: string) => {
    return await apiRequest('/api/auth/login', 'POST', { email, password });
  },

  register: async (name: string, email: string, password: string) => {
    return await apiRequest('/api/auth/register', 'POST', { name, email, password });
  },

  pushData: async (userId: string, key: string, data: any) => {
    // Espelhamento preventivo no LocalStorage
    localStorage.setItem(`myplans_mirror_${key}`, JSON.stringify(data));
    return await apiRequest(`/api/sync/${userId}/${key}`, 'POST', { data });
  },

  pullData: async (userId: string, key: string, fallback: any) => {
    const res = await apiRequest(`/api/sync/${userId}/${key}`, 'GET');
    if (res && res.data) return res.data;
    
    const local = localStorage.getItem(`myplans_mirror_${key}`);
    return local ? JSON.parse(local) : fallback;
  },

  // Mock para administração se necessário
  getUsers: async () => {
    const res = await apiRequest('/api/admin/users', 'GET');
    return res || [];
  }
};
