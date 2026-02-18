
import { UserAccount, UserStatus } from './types';

const USERS_DB_KEY = 'myplans_database_users';

/**
 * CONFIGURAÇÃO DA VPS NA HOSTINGER
 * Tente mudar para 'https' caso o link sslip.io suporte, para evitar erros de conteúdo misto.
 */
const API_URL: string = "http://y0c00ckwckwo04w0ocosc4go.145.223.92.165.sslip.io"; 

export const isUsingAPI = () => {
  return API_URL !== "" && 
         API_URL !== "COLE_O_LINK_FQDN_DO_COOLIFY_AQUI" && 
         API_URL.startsWith('http');
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  if (!isUsingAPI()) return null;
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Servidor respondeu com erro ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error("ERRO CRÍTICO NA CONEXÃO VPS:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("A VPS demorou muito para responder (Timeout). Verifique se o backend no Coolify está realmente ativo.");
    }

    if (error.message === 'Failed to fetch') {
      throw new Error(
        "ERRO DE CONEXÃO (Failed to fetch):\n\n" +
        "1. No Coolify, mude a variável para DATABASE_URL (tudo maiúsculo).\n" +
        "2. Certifique-se de clicar em 'Redeploy' após mudar a variável.\n" +
        "3. Verifique se o seu navegador não está bloqueando 'http' em um site 'https'."
      );
    }
    throw error;
  }
};

export const db = {
  getUsers: async (): Promise<UserAccount[]> => {
    if (isUsingAPI()) {
      try {
        return await apiFetch('/admin/users');
      } catch (e) {
        console.warn("API Offline, lendo do cache local.");
      }
    }
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveUsers: (users: UserAccount[]) => {
    if (!isUsingAPI()) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
  },

  register: async (name: string, email: string, password: string): Promise<{ success: boolean, message: string }> => {
    if (isUsingAPI()) {
      try {
        return await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    }

    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) {
      return { success: false, message: 'E-mail já cadastrado localmente.' };
    }

    const newUser: UserAccount = {
      id: Date.now().toString(),
      name,
      email,
      password,
      status: users.length === 0 ? 'Active' : 'Pending',
      role: users.length === 0 ? 'Admin' : 'User',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(USERS_DB_KEY, JSON.stringify([...users, newUser]));
    return { 
      success: true, 
      message: users.length === 0 ? 'Admin criado!' : 'Cadastro realizado! Aguarde aprovação.' 
    };
  },

  login: async (email: string, password: string): Promise<{ success: boolean, user?: UserAccount, message?: string, status?: UserStatus }> => {
    if (isUsingAPI()) {
      try {
        return await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    }

    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) return { success: false, message: 'E-mail ou senha incorretos.' };
    if (user.status === 'Pending') return { success: false, message: 'Aguardando aprovação do Admin.', status: 'Pending' };
    
    return { success: true, user };
  },

  updateUserStatus: async (userId: string, status: UserStatus) => {
    if (isUsingAPI()) {
      try {
        await apiFetch(`/admin/users/${userId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      } catch (e) {
        console.error("Erro ao atualizar status na VPS");
      }
    } else {
      const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
      const updated = users.map((u: any) => u.id === userId ? { ...u, status } : u);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updated));
    }
  }
};
