
import { UserAccount, UserStatus, Task, Idea, Goal, Event, WorkLog, UserConfig } from './types';

const apiRequest = async (endpoint: string, method: string = 'GET', data?: any) => {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.error || result.message || 'Erro desconhecido' };
    return result;
  } catch (e) {
    console.error(`[API ERROR] Falha ao acessar ${endpoint}`);
    return { success: false, error: 'Não foi possível conectar ao servidor.' };
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
    localStorage.setItem(`myplans_mirror_${key}`, JSON.stringify(data));
    return await apiRequest(`/api/sync/${userId}/${key}`, 'POST', { data });
  },

  pullData: async (userId: string, key: string, fallback: any) => {
    const res = await apiRequest(`/api/sync/${userId}/${key}`, 'GET');
    if (res && res.data) return res.data;
    
    const local = localStorage.getItem(`myplans_mirror_${key}`);
    return local ? JSON.parse(local) : fallback;
  }
};
