
import { UserAccount, UserStatus } from './types';

const USERS_DB_KEY = 'myplans_database_users';

// Simulação de Banco de Dados na LocalStorage
export const db = {
  getUsers: (): UserAccount[] => {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  
  saveUsers: (users: UserAccount[]) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  },

  register: (name: string, email: string, password: string): { success: boolean, message: string } => {
    const users = db.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }

    const newUser: UserAccount = {
      id: Date.now().toString(),
      name,
      email,
      password, // Em produção, usar hash
      status: users.length === 0 ? 'Active' : 'Pending', // Primeiro usuário é Admin/Ativo automático
      role: users.length === 0 ? 'Admin' : 'User',
      createdAt: new Date().toISOString()
    };

    db.saveUsers([...users, newUser]);
    return { 
      success: true, 
      message: users.length === 0 
        ? 'Conta Admin criada com sucesso!' 
        : 'Cadastro realizado! Aguarde a aprovação do administrador.' 
    };
  },

  // Added optional status to return type
  login: (email: string, password: string): { success: boolean, user?: UserAccount, message?: string, status?: UserStatus } => {
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'E-mail ou senha incorretos.' };
    }

    if (user.status === 'Pending') {
      return { success: false, message: 'Sua conta ainda não foi aprovada pelo administrador.', status: 'Pending' };
    }

    if (user.status === 'Blocked') {
      return { success: false, message: 'Esta conta foi bloqueada.' };
    }

    return { success: true, user };
  },

  updateUserStatus: (userId: string, status: UserStatus) => {
    const users = db.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    db.saveUsers(updated);
  }
};
