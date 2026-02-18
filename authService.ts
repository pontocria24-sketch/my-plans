
import { UserAccount, UserStatus } from './types';

const USERS_DB_KEY = 'myplans_database_users';

/**
 * URL DA API NA VPS (Confirmada via screenshot do Coolify)
 */
const API_BASE: string = "y0c00ckwckwo04w0ocosc4go.145.223.92.165.sslip.io"; 

export const isUsingAPI = () => {
  return API_BASE !== "" && !API_BASE.includes("COLE_O_LINK");
};

const getFullUrl = (endpoint: string, protocol: 'http://' | 'https://' = 'http://') => {
  const cleanBase = API_BASE.replace('http://', '').replace('https://', '').replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${protocol}${cleanBase}${cleanEndpoint}`;
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  if (!isUsingAPI()) return null;

  // Forçamos HTTP pois o screenshot do Coolify mostra que não há SSL (HTTPS) configurado ainda
  const url = getFullUrl(endpoint, 'http://');
  
  console.log(`[MYPLANS] Tentando conexão externa: ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Fallback para rotas com prefixo /api caso o backend tenha sido gerado assim
    if (response.status === 404 && !endpoint.includes('/api')) {
      const retryUrl = getFullUrl(`/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, 'http://');
      const retryResponse = await fetch(retryUrl, { ...options, mode: 'cors' });
      if (retryResponse.ok) return retryResponse.json();
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("[MYPLANS ERROR]:", error);

    // Se o site principal for HTTPS e a API for HTTP, o navegador vai dar erro de 'Failed to fetch'
    if (window.location.protocol === 'https:') {
      throw new Error(
        "BLOQUEIO DE SEGURANÇA (Mixed Content): O navegador impede conexões HTTP dentro de sites HTTPS. " +
        "PASSO PARA CORRIGIR: Abra o link http://" + API_BASE + " em uma nova aba, aceite o risco se houver, e volte aqui para tentar o login novamente."
      );
    }

    throw new Error(
      "VPS NÃO RESPONDE: Verifique se o Firewall da Hostinger permite tráfego na porta 80. " +
      "Certifique-se de que o DATABASE_URL foi configurado e você deu 'Redeploy'."
    );
  }
};

export const db = {
  getUsers: async (): Promise<UserAccount[]> => {
    if (isUsingAPI()) {
      try {
        const data = await apiFetch('/admin/users');
        if (data) return data;
      } catch (e) {
        console.warn("API Offline, carregando local...");
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
    return { success: false, message: 'API não configurada.' };
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
    return { success: false, message: 'API não configurada.' };
  },

  updateUserStatus: async (userId: string, status: UserStatus) => {
    if (isUsingAPI()) {
      try {
        await apiFetch(`/admin/users/${userId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
