
import { User, UserConfig } from './types';

export const loginUser = async (email: string, password: string, config: UserConfig): Promise<User | null> => {
  // Se você ainda não configurou a API na VPS, podemos usar um modo de simulação
  if (!config.dbHost) {
    console.log("Simulando login local...");
    return {
      id: "usr_1",
      name: "Admin Local",
      email: email,
      token: "dummy_token_123"
    };
  }

  try {
    const response = await fetch(`http://${config.dbHost}:${config.dbPort}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Erro ao conectar com VPS:", error);
    return null;
  }
};

export const registerUser = async (userData: any, config: UserConfig): Promise<User | null> => {
  try {
    const response = await fetch(`http://${config.dbHost}:${config.dbPort}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (response.ok) return await response.json();
    return null;
  } catch (error) {
    return null;
  }
};
