
import { Task, UserConfig } from './types';

export const syncToPostgres = async (tasks: Task[], config: UserConfig) => {
  if (!config.syncEnabled || !config.dbHost) return;

  const endpoint = `http://${config.dbHost}:${config.dbPort}/api/sync/tasks`;
  console.log(`Tentando sincronizar: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks,
        dbCredentials: {
          user: config.dbUser,
          password: config.dbPassword,
          database: config.dbName
        }
      })
    });

    if (response.ok) {
      console.log("✅ Dados sincronizados com sucesso na VPS!");
    } else {
      console.error("❌ Erro na API da VPS: A API retornou erro ou não está configurada para este endpoint.");
    }
  } catch (error) {
    console.error("⚠️ Falha Crítica de Conexão: Certifique-se de que você tem uma API (Node/Python) rodando na VPS para receber os dados do navegador.");
  }
};
